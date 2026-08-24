package com.ofekb.wealthhorizon;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * המקום היחיד שבו ה-snapshot של הווידג'ט נשמר ונקרא.
 *
 * הווידג'ט רץ בתהליך נפרד מהאפליקציה ואין לו גישה ל-SQLite. במקום זה
 * האפליקציה כותבת לכאן אובייקט JSON זעיר, והווידג'ט רק קורא אותו.
 * SharedPreferences מספיק: מדובר במחרוזת אחת של פחות מ-2KB.
 */
public final class WidgetStore {

    private static final String PREFS = "wealth_horizon_widget";
    private static final String KEY_SNAPSHOT = "snapshot";

    private WidgetStore() {}

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext()
                .getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static void save(Context context, String snapshotJson) {
        prefs(context).edit().putString(KEY_SNAPSHOT, snapshotJson).apply();
    }

    /** מחזיר null כשעוד לא נשמר כלום — הווידג'ט מציג אז מצב ריק. */
    public static String load(Context context) {
        return prefs(context).getString(KEY_SNAPSHOT, null);
    }
}
