package com.ofekb.wealthhorizon;

/** המידה המלאה (4x4): מוסיפה את שלוש התנועות האחרונות. */
public class WealthWidgetLarge extends WealthWidgetProvider {
    @Override
    protected int layoutId() {
        return R.layout.widget_large;
    }

    @Override
    protected boolean showsTransactions() {
        return true;
    }
}
