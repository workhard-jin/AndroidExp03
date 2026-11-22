package com.fjnu.jin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.annotation.DrawableRes
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class RecyclerActivity : ComponentActivity() {

    private data class Animal(val name: String, @DrawableRes val photo: Int)

    private val animals = mutableListOf(
        Animal("Lion", R.drawable.animal_lion),
        Animal("Tiger", R.drawable.animal_tiger),
        Animal("Monkey", R.drawable.animal_monkey),
        Animal("Dog", R.drawable.animal_dog),
        Animal("Cat", R.drawable.animal_cat),
        Animal("Elephant", R.drawable.animal_elephant)
    )
    private val copyCount = mutableMapOf<String, Int>()
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: AnimalAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_recycler)

        recyclerView = findViewById(R.id.recyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.addItemDecoration(
            DividerItemDecoration(this, DividerItemDecoration.VERTICAL)
        )
        adapter = AnimalAdapter()
        recyclerView.adapter = adapter
    }

    private fun addRecord(position: Int) {
        val animal = animals[position]
        val count = (copyCount[animal.name] ?: 0) + 1
        copyCount[animal.name] = count
        animals.add(Animal(animal.name + getString(R.string.exp5_copy_suffix, count), animal.photo))
        adapter.notifyItemInserted(animals.size - 1)
        recyclerView.scrollToPosition(animals.size - 1)
    }

    private inner class AnimalAdapter : RecyclerView.Adapter<AnimalViewHolder>() {

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AnimalViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_recycler, parent, false)
            return AnimalViewHolder(view)
        }

        override fun onBindViewHolder(holder: AnimalViewHolder, position: Int) {
            val animal = animals[position]
            holder.tvName.text = animal.name
            holder.ivPhoto.setImageResource(animal.photo)
            holder.tvName.setOnClickListener { addRecord(holder.bindingAdapterPosition) }
        }

        override fun getItemCount(): Int = animals.size
    }

    private class AnimalViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivPhoto: ImageView = view.findViewById(R.id.ivPhoto)
        val tvName: TextView = view.findViewById(R.id.tvName)
    }
}
