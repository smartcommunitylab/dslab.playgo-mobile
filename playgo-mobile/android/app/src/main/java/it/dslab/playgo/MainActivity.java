package it.dslab.playgo;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.BridgeActivity;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class MainActivity extends BridgeActivity {
  @Override
  public void onStart() {
    super.onStart();
    storeBuildInfo();
  }
  private void storeBuildInfo(){
    try {
      String gitVersion = "{hash:\"--\"}";
      SharedPreferences gitInfo = getSharedPreferences("buildInfo", Context.MODE_PRIVATE);
      SharedPreferences.Editor editor = gitInfo.edit();

      try (InputStream inputStream = getAssets().open("git-version.json");) {
        int size = inputStream.available();
        byte[] buffer = new byte[size];
        inputStream.read(buffer);
        gitVersion = new String(buffer);
      } catch (IOException e) {
        e.printStackTrace();
      }

      editor.putString("gitInfo", gitVersion);
      editor.apply();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }



}
