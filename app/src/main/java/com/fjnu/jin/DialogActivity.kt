package com.fjnu.jin

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.ComponentActivity

class DialogActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dialog)

        findViewById<Button>(R.id.btnOpenDialog).setOnClickListener {
            showLoginDialog()
        }
    }

    private fun showLoginDialog() {
        val content = LayoutInflater.from(this).inflate(R.layout.dialog_login, null)
        val dialog = AlertDialog.Builder(this)
            .setView(content)
            .create()

        val etUsername = content.findViewById<EditText>(R.id.etUsername)
        val etPassword = content.findViewById<EditText>(R.id.etPassword)

        content.findViewById<Button>(R.id.btnCancel).setOnClickListener {
            dialog.dismiss()
        }
        content.findViewById<Button>(R.id.btnSignIn).setOnClickListener {
            val username = etUsername.text.toString().trim()
            val password = etPassword.text.toString()
            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, R.string.dialog_login_empty, Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(
                    this,
                    getString(R.string.dialog_login_ok, username),
                    Toast.LENGTH_SHORT
                ).show()
                dialog.dismiss()
            }
        }
        dialog.show()
    }
}
