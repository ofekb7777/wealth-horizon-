package com.ofekb.wealthhorizon;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * הגשר מ-JavaScript לצד הנייטיב.
 *
 * חושף פעולה אחת: קבל snapshot כמחרוזת JSON, שמור אותו, ורענן את
 * הווידג'טים שעל מסך הבית. הצד של ה-JS נמצא ב-`src/widget/index.ts`.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {

    @PluginMethod
    public void updateWidget(PluginCall call) {
        String snapshot = call.getString("snapshot");
        if (snapshot == null) {
            call.reject("snapshot is required");
            return;
        }

        WidgetStore.save(getContext(), snapshot);
        WealthWidgetProvider.refreshAll(getContext());
        call.resolve();
    }
}
