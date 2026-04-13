package com.joshlarminay.migrainemanager;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private int bottomInset = 0;
    private int topInset = 0;

    public class SafeAreaBridge {
        @JavascriptInterface
        public int getBottomInset() { return bottomInset; }

        @JavascriptInterface
        public int getTopInset() { return topInset; }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register the JS interface so web code can query real inset values
        getBridge().getWebView().addJavascriptInterface(new SafeAreaBridge(), "AndroidSafeArea");

        // Listen for system bar insets and store them
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, insets) -> {
            Insets bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            bottomInset = bars.bottom;
            topInset = bars.top;
            return ViewCompat.onApplyWindowInsets(v, insets);
        });
    }
}
