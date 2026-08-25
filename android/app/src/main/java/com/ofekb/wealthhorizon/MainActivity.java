package com.ofekb.wealthhorizon;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // חייב לרוץ לפני super.onCreate — שם Capacitor מאתחל את הגשר
        // ובונה את רשימת התוספים.
        registerPlugin(WidgetBridge.class);
        super.onCreate(savedInstanceState);
    }
}
