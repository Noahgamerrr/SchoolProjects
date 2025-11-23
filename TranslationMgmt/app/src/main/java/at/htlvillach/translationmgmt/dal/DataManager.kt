package at.htlvillach.translationmgmt.dal

import at.htlvillach.translationmgmt.model.Language
import at.htlvillach.translationmgmt.model.Word
import com.google.gson.GsonBuilder
import retrofit2.Callback
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object DataManager {
    // Schule
    //const val BASEURL = "http://172.20.10.3:8080/"
    // Zu Hause
    //const val BASEURL = "http://10.0.0.162:8080/"
    // Emulator
    const val BASEURL = "http://10.0.2.2:8080"
    private val apiInterface: ApiInterface

    init {
        val gson = GsonBuilder()
            .create()
        val retrofit = Retrofit.Builder().baseUrl(BASEURL)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
        apiInterface = retrofit.create(ApiInterface::class.java)
    }

    fun getLanguages(callback: Callback<ArrayList<Language>>) {
        val call = apiInterface.getLanguages()
        call.enqueue(callback)
    }

    fun getWords(callback: Callback<ArrayList<Word>>) {
        val call = apiInterface.getWords()
        call.enqueue(callback)
    }

    fun addWord(word: Word, callback: Callback<Word>) {
        val call = apiInterface.createWord(word)
        call.enqueue(callback)
    }

    fun updateWord(word: Word, callback: Callback<Word>) {
        val call = apiInterface.updateWord(word.id, word)
        call.enqueue(callback)
    }
}