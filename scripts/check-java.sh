#!/usr/bin/env bash
#
# בדיקת קומפילציה לקוד ה-Java של הווידג'ט.
#
#   npm run check:java
#
# **זו לא בניית APK.** אריזה דורשת את ה-Android SDK המלא מ-dl.google.com.
# מה שכן נבדק כאן זה החלק שבאמת נשבר: הקוד עצמו. כל שש המחלקות מקומפלות
# לבייטקוד מול פלטפורמת אנדרואיד אמיתית, מול חתימות אמיתיות של Capacitor,
# ומול R.java שנגזר מהמשאבים שבפרויקט — כך שהפניה למשאב חסר תיפול כאן.
#
# דרישות: JDK, ו-android-sdk-platform-23 מ-apt.
#   sudo apt-get install -y android-sdk-platform-23
#
# למה API 23 ולא 36: זו הפלטפורמה הגבוהה ביותר שקיימת כחבילת מערכת.
# הקוד כאן לא משתמש בשום API מעל 23, ולכן זה מספיק כדי לאמת אותו.
# minSdk של הפרויקט הוא 24, כלומר כל מה שנעשה כאן זמין במכשירי היעד.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$ROOT/.java-check"
PLATFORM="/usr/lib/android-sdk/platforms/android-23/android.jar"
JSON_JAR="$WORK/json.jar"
JSON_URL="https://repo1.maven.org/maven2/org/json/json/20240303/json-20240303.jar"
CAP="$ROOT/node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor"

if [ ! -f "$PLATFORM" ]; then
  echo "✗ חסרה פלטפורמת אנדרואיד: $PLATFORM"
  echo "  התקן עם:  sudo apt-get install -y android-sdk-platform-23"
  exit 1
fi
if [ ! -d "$CAP" ]; then
  echo "✗ לא נמצא קוד המקור של Capacitor. הרץ npm install קודם."
  exit 1
fi

rm -rf "$WORK"; mkdir -p "$WORK/stubs/com/getcapacitor/annotation" "$WORK/stubs/com/ofekb/wealthhorizon" "$WORK/out"

[ -f "$JSON_JAR" ] || curl -sSL --max-time 90 -o "$JSON_JAR" "$JSON_URL"

# --- stubs ל-Capacitor. החתימות תואמות לקוד המקור שב-node_modules ---
cat > "$WORK/stubs/com/getcapacitor/Plugin.java" <<'EOF'
package com.getcapacitor;
import android.content.Context;
public class Plugin { public Context getContext() { return null; } public void load() {} }
EOF
cat > "$WORK/stubs/com/getcapacitor/PluginCall.java" <<'EOF'
package com.getcapacitor;
public class PluginCall {
    public String getString(String name) { return null; }
    public String getString(String name, String defaultValue) { return null; }
    public void resolve() {}
    public void reject(String msg) {}
}
EOF
cat > "$WORK/stubs/com/getcapacitor/PluginMethod.java" <<'EOF'
package com.getcapacitor;
import java.lang.annotation.*;
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
public @interface PluginMethod {}
EOF
cat > "$WORK/stubs/com/getcapacitor/BridgeActivity.java" <<'EOF'
package com.getcapacitor;
import android.app.Activity; import android.os.Bundle;
public class BridgeActivity extends Activity {
    public void registerPlugin(Class<? extends Plugin> plugin) {}
    @Override public void onCreate(Bundle b) { super.onCreate(b); }
}
EOF
cat > "$WORK/stubs/com/getcapacitor/annotation/CapacitorPlugin.java" <<'EOF'
package com.getcapacitor.annotation;
import java.lang.annotation.*;
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.TYPE)
public @interface CapacitorPlugin { String name() default ""; }
EOF

# --- R.java מהמשאבים האמיתיים ---
WORK="$WORK" python3 "$ROOT/scripts/generate-r.py"

javac -nowarn -d "$WORK/out" \
  -cp "$PLATFORM:$JSON_JAR" \
  -sourcepath "$WORK/stubs:$ROOT/android/app/src/main/java" \
  "$WORK"/stubs/com/getcapacitor/*.java \
  "$WORK"/stubs/com/getcapacitor/annotation/*.java \
  "$WORK"/stubs/com/ofekb/wealthhorizon/R.java \
  "$ROOT"/android/app/src/main/java/com/ofekb/wealthhorizon/*.java

COUNT=$(find "$WORK/out/com/ofekb" -name "*.class" ! -name 'R$*' | wc -l)
echo "✓ $COUNT מחלקות Java קומפלו בהצלחה מול פלטפורמת אנדרואיד אמיתית"
