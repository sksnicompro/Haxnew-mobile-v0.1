package com.haxnew.mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var assetLoader: WebViewAssetLoader

    companion object {
        const val HAXBALL_URL = "https://www.haxball.com/play"

        // Mismo Client ID que ya usa la app de escritorio (discordAuth.js).
        const val DISCORD_CLIENT_ID = "1539452814324006954"

        // AVISO DE SEGURIDAD: este Client Secret queda embebido en el APK.
        // Cualquiera que decompile la app puede extraerlo. Es aceptable para
        // un uso privado/entre amigos, pero NO deberia usarse en una app
        // publicada en Play Store sin mover este intercambio a un backend
        // propio. Poner ahi el secret real antes de compilar.
        const val DISCORD_CLIENT_SECRET = "PONE_ACA_TU_CLIENT_SECRET"

        const val REDIRECT_URI = "haxnew://auth"

        // Mismo orden que runtime.js, pero solo con lo que decidimos mantener
        // para mobile (field/ball/avatar skins + roomlist), sin cosmeticos,
        // battlepass, spotify, HUD skins, etc. discord-login.js se reemplazo
        // por mobile-login.js (login simple, sin servidor local).
        val EXTENSIONS_TO_INJECT = listOf(
            "core.js",
            "security.js",
            "render-keepalive.js",
            "position-drag.js",
            "settings.js",
            "styles.js",
            "themes.js",
            "roomlist.js",
            "field-skin.js",
            "field-skin-panel.js",
            "field-gallery.js",
            "ball-skin.js",
            "ball-gallery.js",
            "avatar-image.js",
            "avatar-ball-panel.js",
            "mobile-login.js"
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)

        // Sirve los archivos de app/src/main/assets/ bajo un dominio https
        // "virtual" para que el WebView (y los scripts inyectados) puedan
        // pedirlos con fetch/<script src> normal, sin permisos especiales.
        assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false

        // Optimizacion de GPU/memoria pedida: aceleracion por hardware
        // explicita para el WebView (evita que Android caiga a software
        // rendering en dispositivos de gama baja) y cache habilitado para
        // no re-descargar el juego cada vez que se abre la app.
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null)
        webView.settings.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT

        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun onPageFinished(view: WebView, url: String?) {
                super.onPageFinished(view, url)
                if (url != null && (url.contains("haxball.com"))) {
                    injectExtensions()
                }
            }
        }

        webView.loadUrl(HAXBALL_URL)
    }

    private fun injectExtensions() {
        for (name in EXTENSIONS_TO_INJECT) {
            try {
                val js = assets.open("extensions/$name").bufferedReader().use { it.readText() }
                webView.evaluateJavascript(js, null)
            } catch (e: Exception) {
                // Si un archivo falla no frenamos el resto (mismo criterio
                // que el try/catch de la app de escritorio).
                e.printStackTrace()
            }
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun startDiscordLogin() {
            runOnUiThread {
                val authUrl = "https://discord.com/api/oauth2/authorize" +
                    "?client_id=$DISCORD_CLIENT_ID" +
                    "&redirect_uri=${URLEncoder.encode(REDIRECT_URI, "UTF-8")}" +
                    "&response_type=code&scope=identify"
                CustomTabsIntent.Builder().build().launchUrl(this@MainActivity, Uri.parse(authUrl))
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val data: Uri? = intent.data
        if (data != null && data.scheme == "haxnew" && data.host == "auth") {
            val code = data.getQueryParameter("code")
            if (code != null) {
                exchangeCodeForUser(code)
            }
        }
    }

    private fun exchangeCodeForUser(code: String) {
        Thread {
            try {
                val tokenConn = URL("https://discord.com/api/oauth2/token")
                    .openConnection() as HttpURLConnection
                tokenConn.requestMethod = "POST"
                tokenConn.doOutput = true
                tokenConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
                val body = "client_id=$DISCORD_CLIENT_ID" +
                    "&client_secret=$DISCORD_CLIENT_SECRET" +
                    "&grant_type=authorization_code" +
                    "&code=$code" +
                    "&redirect_uri=${URLEncoder.encode(REDIRECT_URI, "UTF-8")}"
                tokenConn.outputStream.use { it.write(body.toByteArray()) }
                val tokenJson = JSONObject(tokenConn.inputStream.bufferedReader().use { it.readText() })
                val accessToken = tokenJson.getString("access_token")

                val userConn = URL("https://discord.com/api/users/@me")
                    .openConnection() as HttpURLConnection
                userConn.setRequestProperty("Authorization", "Bearer $accessToken")
                val userJson = JSONObject(userConn.inputStream.bufferedReader().use { it.readText() })

                val username = userJson.getString("username")
                val id = userJson.getString("id")
                val avatarHash = userJson.optString("avatar", "")
                val avatarUrl = if (avatarHash.isNotEmpty())
                    "https://cdn.discordapp.com/avatars/$id/$avatarHash.png"
                else
                    "https://cdn.discordapp.com/embed/avatars/0.png"

                val payload = JSONObject()
                payload.put("username", username)
                payload.put("avatarUrl", avatarUrl)

                runOnUiThread {
                    webView.evaluateJavascript(
                        "window.__haxnewOnDiscordLogin && window.__haxnewOnDiscordLogin($payload);",
                        null
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }
}
