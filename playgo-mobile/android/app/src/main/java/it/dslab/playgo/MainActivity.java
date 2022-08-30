package it.dslab.playgo;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.CapConfig;
import com.getcapacitor.PluginConfig;

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
  

  private String getGitVersion() {
    String gitVersion = "{hash:\"--\"}";
    try (InputStream inputStream = getAssets().open("git-version.json");) {
      int size = inputStream.available();
      byte[] buffer = new byte[size];
      inputStream.read(buffer);
      gitVersion = new String(buffer);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return gitVersion;
  }

  private String getCodePushChannel() {

    CapConfig configInstance = getBridge().getConfig();
    PluginConfig codePushConfig = configInstance.getPluginConfiguration("CodePush");
    String usedDeployKey = codePushConfig.getString("ANDROID_DEPLOY_KEY");
    String stagingDeployKey = codePushConfig.getString("ANDROID___STAGING___DEPLOY_KEY");
    String prodDeployKey = codePushConfig.getString("ANDROID___PROD______DEPLOY_KEY");
    if (usedDeployKey.equals(stagingDeployKey)) {
      return "Staging";
    }
    if (usedDeployKey.equals(prodDeployKey)) {
      return "Production";
    }
    return usedDeployKey;
  }

  private void storeBuildInfo() {
    try {
      SharedPreferences gitInfo = getSharedPreferences("buildInfo", Context.MODE_PRIVATE);
      SharedPreferences.Editor editor = gitInfo.edit();

      editor.putString("gitInfo", getGitVersion());
      editor.putString("codePushChannel", getCodePushChannel());

      editor.apply();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }


}
