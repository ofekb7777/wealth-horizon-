package com.ofekb.wealthhorizon;

/** המידה הקומפקטית (4x2): יתרה והוצאה מול תקציב בלבד. */
public class WealthWidgetSmall extends WealthWidgetProvider {
    @Override
    protected int layoutId() {
        return R.layout.widget_small;
    }

    @Override
    protected boolean showsTransactions() {
        return false;
    }
}
