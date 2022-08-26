package it.dslab.playgo;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onStart() {
    super.onStart();
    SharedPreferences gitInfo = getSharedPreferences("gitInfo", Context.MODE_PRIVATE);
    SharedPreferences.Editor editor = gitInfo.edit();
    editor.putString("hash", "123");
    editor.apply();
  }




}
