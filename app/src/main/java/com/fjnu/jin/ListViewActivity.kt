package com.fjnu.jin

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.ListView
import android.widget.SimpleAdapter
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.core.app.NotificationCompat

class ListViewActivity : ComponentActivity() {

    private val animals = listOf(
        "Lion" to R.drawable.animal_lion,
        "Tiger" to R.drawable.animal_tiger,
        "Monkey" to R.drawable.animal_monkey,
        "Dog" to R.drawable.animal_dog,
        "Cat" to R.drawable.animal_cat,
        "Elephant" to R.drawable.animal_elephant
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_list)
        createNotificationChannel()
        requestNotificationPermission()

        val data = animals.map { (name, icon) ->
            mapOf("name" to name, "icon" to icon)
        }
        val adapter = SimpleAdapter(
            this,
            data,
            R.layout.item_animal,
            arrayOf("name", "icon"),
            intArrayOf(R.id.tvName, R.id.ivIcon)
        )

        val listView = findViewById<ListView>(R.id.listView)
        listView.adapter = adapter
        listView.choiceMode = ListView.CHOICE_MODE_SINGLE
        listView.setOnItemClickListener { _, _, position, _ ->
            val name = animals[position].first
            listView.setItemChecked(position, true)
            Toast.makeText(this, getString(R.string.exp1_selected, name), Toast.LENGTH_SHORT).show()
            sendNotification(name)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.exp1_notification_channel),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = getString(R.string.exp1_notification_channel_desc)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQUEST_NOTIFICATION)
        }
    }

    private fun sendNotification(name: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            Toast.makeText(this, R.string.notification_permission_denied, Toast.LENGTH_SHORT).show()
            return
        }
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(name)
            .setContentText(getString(R.string.exp1_notification_text, name))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
        getSystemService(NotificationManager::class.java).notify(NOTIFICATION_ID, notification)
    }

    companion object {
        private const val CHANNEL_ID = "list_view_channel"
        private const val NOTIFICATION_ID = 1
        private const val REQUEST_NOTIFICATION = 100
    }
}
