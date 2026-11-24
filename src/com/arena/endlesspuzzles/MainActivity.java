package com.arena.endlesspuzzles;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Offline-only WebView shell for the Puzzle Lab game.
 * Security posture:
 *  - No INTERNET / storage / location / camera / microphone permissions in the manifest.
 *  - Local HTML is injected from assets as a string under an https://puzzle.local/ base,
 *    so file:// access can stay completely disabled.
 *  - No Java-to-JavaScript bridge (no addJavascriptInterface), no downloads, no file access.
 *  - Every URL navigation and every sub-resource request is blocked by the WebViewClient.
 *  - No third-party SDKs, ads, analytics or trackers.
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.parseColor("#060911")));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.parseColor("#060911"));
            window.setNavigationBarColor(Color.parseColor("#060911"));
        }

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#060911"));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage for progress, sandboxed by Android
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setBlockNetworkLoads(true);
        s.setBlockNetworkImage(true);
        s.setGeolocationEnabled(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.setSafeBrowsingEnabled(false);   // no network permission; avoid background requests
        }

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true; // block all navigation
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return true; // legacy devices
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                // Defence in depth: the inline page needs no sub-resources at all.
                // Only the synthetic local base origin is allowed through.
                android.net.Uri url = request.getUrl();
                if ("https".equals(url.getScheme()) && "puzzle.local".equals(url.getHost())) {
                    return null;
                }
                return new WebResourceResponse("text/plain", "UTF-8",
                        new ByteArrayInputStream(new byte[0]));
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                result.cancel(); // no dialogs from page content
                return true;
            }
        });

        setContentView(web);

        String html = readAsset("index.html");
        web.loadDataWithBaseURL("https://puzzle.local/", html, "text/html", "UTF-8", null);
    }

    private String readAsset(String name) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        InputStream in = null;
        try {
            in = getAssets().open(name);
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return new String(out.toByteArray(), "UTF-8");
        } catch (IOException e) {
            return "<!doctype html><html><body style='background:#060911;color:#fff;font-family:sans-serif;padding:24px'>"
                    + "Unable to load game assets.</body></html>";
        } finally {
            if (in != null) try { in.close(); } catch (IOException ignored) { }
        }
    }

    private void callJs(String expression) {
        if (web == null) return;
        try {
            web.evaluateJavascript("(function(){try{" + expression + "}catch(e){}})()", null);
        } catch (Exception ignored) { }
    }

    @Override
    public void onBackPressed() {
        callJs("window.appBack&&window.appBack()");
    }

    @Override
    protected void onPause() {
        callJs("window.onAppPause&&window.onAppPause()");
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        callJs("window.onAppResume&&window.onAppResume()");
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
