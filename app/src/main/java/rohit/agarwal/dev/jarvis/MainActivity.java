package rohit.agarwal.dev.jarvis;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;


public class MainActivity extends AppCompatActivity implements TextToSpeech.OnInitListener{
    private TextView speakButton;
    private TextToSpeech tts;
    private ListView mMessageListView;
    private MessageAdapter mMessageAdapter;
    private final int REQ_CODE_SPEECH_INPUT = 100;
    List<FriendlyMessage> friendlyMessages;
    private String REGISTER_URL ="https://ba14a731.ngrok.io/response";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        speakButton = (TextView) findViewById(R.id.btnSpeak);
        tts = new TextToSpeech(this, this);
        mMessageListView = (ListView) findViewById(R.id.messageListView);

        // Initialize message ListView and its adapter
        friendlyMessages = new ArrayList<>();
        mMessageAdapter = new MessageAdapter(this, R.layout.item_message, friendlyMessages);
        mMessageListView.setAdapter(mMessageAdapter);


        speakButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                askSpeechInput();

            }
        });
    }

    private void speakOut(String reply) {
        CharSequence text = ""+reply;

        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null,"id1");
    }

    private void askSpeechInput() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
                "Hi speak something");
        try {
            startActivityForResult(intent, REQ_CODE_SPEECH_INPUT);
        } catch (ActivityNotFoundException a) {

        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch (requestCode) {
            case REQ_CODE_SPEECH_INPUT: {
                if (resultCode == RESULT_OK && null != data) {

                    ArrayList<String> result = data
                            .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                    FriendlyMessage friendlyMessage=new FriendlyMessage(result.get(0),"Rohit",null);
                    friendlyMessages.add(friendlyMessage);
                    Log.d("Some", "onActivityResult: "+result.get(0));
                    sendMessage(result.get(0));
                }
                break;
            }

        }
    }

    private void sendMessage(final String msg) {
        Log.d("Some", "sendMessage: "+msg);
        HashMap<String, String> params = new HashMap<String, String>();
        params.put("msg", msg);

        JsonObjectRequest req = new JsonObjectRequest(REGISTER_URL, new JSONObject(params),
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            VolleyLog.v("Response:%n %s", response.toString(4));
                            String reply=response.optString("response");
                            FriendlyMessage friendlyMessage=new FriendlyMessage(reply,"Jarvis",null);
                            friendlyMessages.add(friendlyMessage);
                            speakOut(reply);
                        } catch (JSONException e) {
                            e.printStackTrace();
                            speakOut("I didn't get you sir");
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                VolleyLog.e("Error: ", error.getMessage());
                speakOut("there is some problem Sir");
            }
        });
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        requestQueue.add(req);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {

            int result = tts.setLanguage(new Locale("en", "IN"));

            if (result == TextToSpeech.LANG_MISSING_DATA
                    || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "This Language is not supported");
            } else {
                speakButton.setEnabled(true);
            }

        } else {
            Log.e("TTS", "Initilization Failed!");
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
