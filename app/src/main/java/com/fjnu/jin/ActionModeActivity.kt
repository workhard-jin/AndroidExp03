package com.fjnu.jin

import android.os.Bundle
import android.view.ActionMode
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.ImageView
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity

class ActionModeActivity : ComponentActivity() {

    private val items = mutableListOf("One", "Two", "Three", "Four", "Five")
    private val selected = mutableSetOf<Int>()
    private var actionMode: ActionMode? = null
    private lateinit var adapter: ActionAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_action_mode)

        val listView = findViewById<ListView>(R.id.listView)
        adapter = ActionAdapter()
        listView.adapter = adapter

        listView.setOnItemLongClickListener { _, _, position, _ ->
            if (actionMode == null) {
                actionMode = startActionMode(callback)
            }
            toggleSelection(position)
            true
        }
        listView.setOnItemClickListener { _, _, position, _ ->
            if (actionMode != null) {
                toggleSelection(position)
            }
        }
    }

    private fun toggleSelection(position: Int) {
        if (!selected.add(position)) {
            selected.remove(position)
        }
        if (selected.isEmpty()) {
            actionMode?.finish()
        } else {
            actionMode?.title = getString(R.string.exp4_selected_count, selected.size)
            adapter.notifyDataSetChanged()
        }
    }

    private fun deleteSelected() {
        val count = selected.size
        selected.sortedDescending().forEach { items.removeAt(it) }
        selected.clear()
        adapter.notifyDataSetChanged()
        Toast.makeText(this, getString(R.string.exp4_deleted, count), Toast.LENGTH_SHORT).show()
    }

    private val callback = object : ActionMode.Callback {
        override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
            mode.menuInflater.inflate(R.menu.menu_context, menu)
            mode.title = getString(R.string.exp4_selected_count, selected.size)
            return true
        }

        override fun onPrepareActionMode(mode: ActionMode, menu: Menu): Boolean = false

        override fun onActionItemClicked(mode: ActionMode, item: MenuItem): Boolean {
            return if (item.itemId == R.id.actionDelete) {
                deleteSelected()
                mode.finish()
                true
            } else {
                false
            }
        }

        override fun onDestroyActionMode(mode: ActionMode) {
            actionMode = null
            selected.clear()
            adapter.notifyDataSetChanged()
        }
    }

    private inner class ActionAdapter : BaseAdapter() {
        private val inflater = LayoutInflater.from(this@ActionModeActivity)

        override fun getCount(): Int = items.size

        override fun getItem(position: Int): String = items[position]

        override fun getItemId(position: Int): Long = position.toLong()

        override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
            val view = convertView ?: inflater.inflate(R.layout.item_action, parent, false)
            view.findViewById<TextView>(R.id.tvName).text = items[position]
            val checked = selected.contains(position)
            view.isActivated = checked
            view.findViewById<ImageView>(R.id.ivIcon).isActivated = checked
            view.findViewById<TextView>(R.id.tvCheck).visibility =
                if (checked) View.VISIBLE else View.INVISIBLE
            return view
        }
    }
}
