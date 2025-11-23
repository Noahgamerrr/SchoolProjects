package at.htlvillach.noaharsic.vocabtrainer.dal

import at.htlvillach.noaharsic.vocabtrainer.model.Language
import at.htlvillach.noaharsic.vocabtrainer.model.Translation
import at.htlvillach.noaharsic.vocabtrainer.model.Word
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
        val gson = GsonBuilder().create()
        val retrofit = Retrofit.Builder().baseUrl(BASEURL)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
        apiInterface = retrofit.create(ApiInterface::class.java)
    }

    fun getLanguages(callback: Callback<List<Language>>) {
        val call = apiInterface.getLanguages()
        call.enqueue(callback)
    }

    fun getWords(callback: Callback<List<Word>>) {
        val call = apiInterface.getWords()
        call.enqueue(callback)
    }

    fun getTranslations(
        callback: Callback<List<Translation>>,
        from: Int,
        to: Int
    ) {
        val call = apiInterface.getTranslations(from, to)
        call.enqueue(callback)
    }
}