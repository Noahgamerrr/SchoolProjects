package at.htlvillach.noaharsic.vocabtrainer.dal

import at.htlvillach.noaharsic.vocabtrainer.model.Language
import at.htlvillach.noaharsic.vocabtrainer.model.Translation
import at.htlvillach.noaharsic.vocabtrainer.model.Word
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Query

interface ApiInterface {
    @GET("languages")
    fun getLanguages(): Call<List<Language>>

    @GET("words")
    fun getWords(): Call<List<Word>>

    @GET("translations")
    fun getTranslations(
        @Query("fromLanguage") from: Int,
        @Query("toLanguage") to: Int
    ): Call<List<Translation>>
}