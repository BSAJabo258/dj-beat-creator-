package com.bau.bc16;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/* BC-16 on Android: a full-screen instrument.
   - immersive full screen (swipe from an edge to see the system bars),
   - the screen stays on while the app is open,
   - audio can start from the first tap,
   - the phone's back button walks back through the machines (BC16_back in js/native.js) instead of closing the app. */
public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    c.hide(WindowInsetsCompat.Type.systemBars());
    c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    WebView wv = getBridge().getWebView();
    wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        wv.evaluateJavascript("(window.BC16_back&&window.BC16_back())?'1':'0'", r -> {
          if (r == null || !r.contains("1")) moveTaskToBack(true);
        });
      }
    });
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
      c.hide(WindowInsetsCompat.Type.systemBars());
    }
  }
}
