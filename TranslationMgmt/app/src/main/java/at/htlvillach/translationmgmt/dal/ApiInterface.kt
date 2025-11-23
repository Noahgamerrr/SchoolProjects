package at.htlvillach.translationmgmt.dal

import at.htlvillach.translationmgmt.model.Language
import at.htlvillach.translationmgmt.model.Word
import retrofit2.Call
import retrofit2.http.*

interface ApiInterface {
    @GET("languages")
    fun getLanguages() : Call<ArrayList<Language>>
    @GET("words")
    fun getWords() : Call<ArrayList<Word>>
    @POST("words")
    fun createWord(@Body word: Word) : Call<Word>
    @PUT("words/{id}")
    fun updateWord(@Path("id") id: Int, @Body word: Word) : Call<Word>
}