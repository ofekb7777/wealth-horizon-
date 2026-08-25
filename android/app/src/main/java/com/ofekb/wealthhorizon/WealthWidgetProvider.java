package com.ofekb.wealthhorizon;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.Date;
import java.util.Locale;

/**
 * הווידג'ט של מסך הבית.
 *
 * **הוא לא ניגש למסד הנתונים ולא לרשת.** כל מה שהוא מציג מגיע מ-snapshot
 * שהאפליקציה כתבה ל-SharedPreferences. לכן הוא מיידי, ועובד גם במצב טיסה.
 *
 * מחלקה אחת מרנדרת את שתי המידות; היורשות רק אומרות באיזה layout להשתמש.
 *
 * למה RemoteViews ולא Jetpack Glance: Glance היה מחייב להוסיף לפרויקט את
 * תוסף Kotlin, את מהדר Compose ואת תלות Glance, ולהתאים ביניהם גרסאות.
 * הווידג'ט הזה הוא טקסט ופס התקדמות — RemoteViews עושה את זה בלי להוסיף
 * שום דבר לשרשרת הבנייה. אפשר לעבור ל-Glance בהמשך.
 */
public abstract class WealthWidgetProvider extends AppWidgetProvider {

    /** איזה layout לנפח. כל מידה מחזירה משלה. */
    protected abstract int layoutId();

    /** האם המידה הזו מציגה את רשימת התנועות. */
    protected abstract boolean showsTransactions();

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] widgetIds) {
        for (int widgetId : widgetIds) {
            manager.updateAppWidget(widgetId, buildViews(context));
        }
    }

    /** מרענן כל ווידג'ט מכל המידות. נקרא מהגשר אחרי שינוי בנתונים. */
    public static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        refresh(context, manager, WealthWidgetSmall.class);
        refresh(context, manager, WealthWidgetLarge.class);
    }

    private static void refresh(Context context, AppWidgetManager manager,
                                Class<? extends WealthWidgetProvider> provider) {
        ComponentName name = new ComponentName(context, provider);
        int[] ids = manager.getAppWidgetIds(name);
        if (ids == null || ids.length == 0) return;

        try {
            WealthWidgetProvider instance = provider.getDeclaredConstructor().newInstance();
            RemoteViews views = instance.buildViews(context);
            for (int id : ids) manager.updateAppWidget(id, views);
        } catch (Exception e) {
            // ווידג'ט שלא התרענן הוא לא סיבה להפיל את האפליקציה.
            android.util.Log.w("WealthWidget", "refresh failed", e);
        }
    }

    private RemoteViews buildViews(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId());

        // לחיצה על הווידג'ט פותחת את האפליקציה.
        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        views.setOnClickPendingIntent(R.id.widget_root,
                PendingIntent.getActivity(context, 0, open, flags));

        String raw = WidgetStore.load(context);
        if (raw == null) {
            renderEmpty(context, views);
            return views;
        }

        try {
            render(context, views, new JSONObject(raw));
        } catch (JSONException e) {
            android.util.Log.w("WealthWidget", "bad snapshot", e);
            renderEmpty(context, views);
        }
        return views;
    }

    /** מצב לפני שהאפליקציה נפתחה בפעם הראשונה. */
    private void renderEmpty(Context context, RemoteViews views) {
        views.setTextViewText(R.id.widget_balance, context.getString(R.string.widget_no_data));
        views.setTextViewText(R.id.widget_budget_line, context.getString(R.string.widget_open_app));
        views.setViewVisibility(R.id.widget_progress, View.GONE);
        views.setTextViewText(R.id.widget_updated, "");
        if (showsTransactions()) {
            views.setViewVisibility(R.id.widget_transactions, View.GONE);
        }
    }

    private void render(Context context, RemoteViews views, JSONObject snapshot) {
        String symbol = snapshot.optString("currencySymbol", "");
        double balance = snapshot.optDouble("balance", 0);
        double spend = snapshot.optDouble("monthlySpend", 0);
        double budget = snapshot.optDouble("monthlyBudget", 0);

        views.setTextViewText(R.id.widget_balance, money(symbol, balance));

        if (budget > 0) {
            int percent = (int) Math.round(Math.min(100, (spend / budget) * 100));
            views.setViewVisibility(R.id.widget_progress, View.VISIBLE);
            views.setProgressBar(R.id.widget_progress, 100, percent, false);
            views.setTextViewText(R.id.widget_budget_line, context.getString(
                    R.string.widget_budget_line, money(symbol, spend), money(symbol, budget), percent));
        } else {
            // בלי תקציב מוגדר אין מה למדוד מולו — מציגים רק כמה הוצא.
            views.setViewVisibility(R.id.widget_progress, View.GONE);
            views.setTextViewText(R.id.widget_budget_line,
                    context.getString(R.string.widget_spend_only, money(symbol, spend)));
        }

        views.setTextViewText(R.id.widget_updated, updatedLabel(context, snapshot));

        if (showsTransactions()) {
            renderTransactions(context, views, snapshot.optJSONArray("recentTransactions"), symbol);
        }
    }

    private void renderTransactions(Context context, RemoteViews views,
                                    JSONArray transactions, String symbol) {
        int[] rows = { R.id.widget_tx_1, R.id.widget_tx_2, R.id.widget_tx_3 };
        int[] amounts = { R.id.widget_tx_1_amount, R.id.widget_tx_2_amount, R.id.widget_tx_3_amount };

        if (transactions == null || transactions.length() == 0) {
            views.setViewVisibility(R.id.widget_transactions, View.GONE);
            return;
        }
        views.setViewVisibility(R.id.widget_transactions, View.VISIBLE);

        for (int i = 0; i < rows.length; i++) {
            if (i >= transactions.length()) {
                views.setViewVisibility(rows[i], View.GONE);
                views.setViewVisibility(amounts[i], View.GONE);
                continue;
            }
            JSONObject tx = transactions.optJSONObject(i);
            if (tx == null) {
                views.setViewVisibility(rows[i], View.GONE);
                views.setViewVisibility(amounts[i], View.GONE);
                continue;
            }

            double amount = tx.optDouble("amount", 0);
            views.setViewVisibility(rows[i], View.VISIBLE);
            views.setViewVisibility(amounts[i], View.VISIBLE);
            views.setTextViewText(rows[i], tx.optString("description", "—"));
            views.setTextViewText(amounts[i], money(symbol, amount));
            views.setTextColor(amounts[i], context.getColor(
                    amount < 0 ? R.color.widgetNegative : R.color.widgetPositive));
        }
    }

    /**
     * שעת העדכון, לא "לפני X דקות".
     *
     * הווידג'ט מתרנדר רק כשהנתונים משתנים, ולכן זמן יחסי היה נתקע על
     * "לפני דקה" גם שעות אחר כך. שעה מוחלטת נשארת נכונה תמיד.
     */
    private String updatedLabel(Context context, JSONObject snapshot) {
        String iso = snapshot.optString("lastUpdated", "");
        if (iso.isEmpty()) return "";
        try {
            SimpleDateFormat parser =
                    new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            parser.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
            Date when = parser.parse(iso);
            if (when == null) return "";
            String time = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(when);
            return context.getString(R.string.widget_updated_at, time);
        } catch (ParseException e) {
            return "";
        }
    }

    /** מספר בפורמט קבוע, בלי תלות בשפת המכשיר. */
    private String money(String symbol, double value) {
        return String.format(Locale.US, "%s%,.0f", symbol, value);
    }
}
