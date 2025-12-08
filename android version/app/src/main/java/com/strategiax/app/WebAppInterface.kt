package com.strategiax.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * JavaScript Interface for communication between WebView and native Android code.
 *
 * Usage in JavaScript:
 * - window.Android.showInterstitial()
 * - window.Android.shareContent(title, text, url)
 * - window.Android.showToast(message)
 * - window.Android.copyToClipboard(text)
 * - window.Android.getDeviceInfo()
 * - window.Android.openExternalUrl(url)
 * - window.Android.vibrate(duration)
 */
class WebAppInterface(private val activity: MainActivity) {

    companion object {
        private const val TAG = "WebAppInterface"
    }

    /**
     * Shows an interstitial ad.
     * Called from JavaScript: window.Android.showInterstitial()
     */
    @JavascriptInterface
    fun showInterstitial() {
        Log.d(TAG, "showInterstitial called from JavaScript")
        activity.showInterstitial()
    }

    /**
     * Shares content using the native share dialog.
     * Called from JavaScript: window.Android.shareContent(title, text, url)
     */
    @JavascriptInterface
    fun shareContent(title: String, text: String, url: String) {
        Log.d(TAG, "shareContent called: $title")
        activity.shareContent(title, text, url)
    }

    /**
     * Shows a native toast message.
     * Called from JavaScript: window.Android.showToast(message)
     */
    @JavascriptInterface
    fun showToast(message: String) {
        Log.d(TAG, "showToast called: $message")
        activity.showToast(message)
    }

    /**
     * Copies text to the system clipboard.
     * Called from JavaScript: window.Android.copyToClipboard(text)
     * @return true if successful
     */
    @JavascriptInterface
    fun copyToClipboard(text: String): Boolean {
        return try {
            val clipboard = activity.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Strategia-X", text)
            clipboard.setPrimaryClip(clip)
            Log.d(TAG, "Text copied to clipboard")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to copy to clipboard", e)
            false
        }
    }

    /**
     * Returns device information as a JSON string.
     * Called from JavaScript: JSON.parse(window.Android.getDeviceInfo())
     */
    @JavascriptInterface
    fun getDeviceInfo(): String {
        val deviceInfo = JSONObject().apply {
            put("platform", "android")
            put("manufacturer", Build.MANUFACTURER)
            put("model", Build.MODEL)
            put("sdkVersion", Build.VERSION.SDK_INT)
            put("androidVersion", Build.VERSION.RELEASE)
            put("appVersion", BuildConfig.VERSION_NAME)
            put("appVersionCode", BuildConfig.VERSION_CODE)
            put("isDebug", BuildConfig.DEBUG)
        }
        return deviceInfo.toString()
    }

    /**
     * Opens a URL in the external browser.
     * Called from JavaScript: window.Android.openExternalUrl(url)
     */
    @JavascriptInterface
    fun openExternalUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            activity.startActivity(intent)
            Log.d(TAG, "Opening external URL: $url")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open URL: $url", e)
        }
    }

    /**
     * Triggers device vibration.
     * Called from JavaScript: window.Android.vibrate(duration)
     * @param duration Vibration duration in milliseconds
     */
    @JavascriptInterface
    fun vibrate(duration: Long) {
        try {
            @Suppress("DEPRECATION")
            val vibrator = activity.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    android.os.VibrationEffect.createOneShot(
                        duration,
                        android.os.VibrationEffect.DEFAULT_AMPLITUDE
                    )
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(duration)
            }
            Log.d(TAG, "Vibrate for ${duration}ms")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to vibrate", e)
        }
    }

    /**
     * Stores a key-value pair in SharedPreferences.
     * Called from JavaScript: window.Android.setPreference(key, value)
     */
    @JavascriptInterface
    fun setPreference(key: String, value: String) {
        try {
            val prefs = activity.getSharedPreferences("strategiax_prefs", Context.MODE_PRIVATE)
            prefs.edit().putString(key, value).apply()
            Log.d(TAG, "Preference saved: $key")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save preference: $key", e)
        }
    }

    /**
     * Retrieves a value from SharedPreferences.
     * Called from JavaScript: window.Android.getPreference(key)
     * @return The stored value or empty string if not found
     */
    @JavascriptInterface
    fun getPreference(key: String): String {
        return try {
            val prefs = activity.getSharedPreferences("strategiax_prefs", Context.MODE_PRIVATE)
            prefs.getString(key, "") ?: ""
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get preference: $key", e)
            ""
        }
    }

    /**
     * Checks if the device has an active internet connection.
     * Called from JavaScript: window.Android.isOnline()
     */
    @JavascriptInterface
    fun isOnline(): Boolean {
        return try {
            val connectivityManager = activity.getSystemService(Context.CONNECTIVITY_SERVICE)
                as android.net.ConnectivityManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = connectivityManager.activeNetwork
                val capabilities = connectivityManager.getNetworkCapabilities(network)
                capabilities?.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
            } else {
                @Suppress("DEPRECATION")
                connectivityManager.activeNetworkInfo?.isConnected == true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check network status", e)
            false
        }
    }

    /**
     * Returns true to indicate this is running in native Android.
     * Called from JavaScript: window.Android.isNativeApp()
     */
    @JavascriptInterface
    fun isNativeApp(): Boolean {
        return true
    }

    /**
     * Logs a message to Android's Logcat for debugging.
     * Called from JavaScript: window.Android.log(tag, message)
     */
    @JavascriptInterface
    fun log(tag: String, message: String) {
        Log.d("JS-$tag", message)
    }
}
