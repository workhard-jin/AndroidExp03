package com.fjnu.jin

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import android.widget.Button

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnExperiment1).setOnClickListener {
            startActivity(Intent(this, ListViewActivity::class.java))
        }
        findViewById<Button>(R.id.btnExperiment2).setOnClickListener {
            startActivity(Intent(this, DialogActivity::class.java))
        }
        findViewById<Button>(R.id.btnExperiment3).setOnClickListener {
            startActivity(Intent(this, MenuXmlActivity::class.java))
        }
        findViewById<Button>(R.id.btnExperiment4).setOnClickListener {
            startActivity(Intent(this, ActionModeActivity::class.java))
        }
        findViewById<Button>(R.id.btnExperiment5).setOnClickListener {
            startActivity(Intent(this, RecyclerActivity::class.java))
        }
    }
}
