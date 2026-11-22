package com.fjnu.jin

import android.graphics.Color
import android.os.Bundle
import android.util.TypedValue
import android.view.Menu
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity

class MenuXmlActivity : ComponentActivity() {

    private lateinit var tvTest: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu)
        tvTest = findViewById(R.id.tvTest)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_xml, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.menuSizeSmall -> setTestTextSize(10f)
            R.id.menuSizeMedium -> setTestTextSize(16f)
            R.id.menuSizeLarge -> setTestTextSize(20f)
            R.id.menuNormal -> {
                Toast.makeText(this, R.string.menu_normal_toast, Toast.LENGTH_SHORT).show()
                return true
            }
            R.id.menuColorRed -> tvTest.setTextColor(Color.RED)
            R.id.menuColorBlack -> tvTest.setTextColor(Color.BLACK)
            else -> return super.onOptionsItemSelected(item)
        }
        return true
    }

    private fun setTestTextSize(sizeSp: Float) {
        tvTest.setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp)
    }
}
