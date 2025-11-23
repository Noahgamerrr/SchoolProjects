package at.htlvillach.translationmgmt.ui

import android.util.Log
import androidx.compose.runtime.toMutableStateList
import androidx.lifecycle.ViewModel
import at.htlvillach.translationmgmt.dal.DataManager
import at.htlvillach.translationmgmt.model.Language
import at.htlvillach.translationmgmt.model.Word
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LanguagesViewModel : ViewModel() {
    private val _languagesUiState = MutableStateFlow(LanguagesUIState())
    val languagesUIState: StateFlow<LanguagesUIState> = _languagesUiState

    init {
        if (_languagesUiState.value.languagesList.isEmpty()) {
            DataManager.getLanguages(object: Callback<ArrayList<Language>> {
                override fun onResponse(call: Call<ArrayList<Language>>, response: Response<ArrayList<Language>>) {
                    if (response.isSuccessful) {
                        setLanguages(response.body()!!)
                        setWordLanguage(response.body()!![0])
                        Log.d("LANGUAGES", _languagesUiState.value.languagesList.size.toString())
                    }
                }

                override fun onFailure(call: Call<ArrayList<Language>>, t: Throwable) {
                    Log.e("LANGUAGES", "Error loading languages", t)
                }
            })
        }

        if (_languagesUiState.value.wordsList.isEmpty()) {
            DataManager.getWords(object: Callback<ArrayList<Word>> {
                override fun onResponse(call: Call<ArrayList<Word>>, response: Response<ArrayList<Word>>) {
                    if (response.isSuccessful) {
                        setWords(response.body()!!)
                        Log.d("WORDS", _languagesUiState.value.wordsList.size.toString())
                    }
                }

                override fun onFailure(call: Call<ArrayList<Word>>, t: Throwable) {
                    Log.e("WORDS", "Error loading languages", t)
                }
            })
        }
    }

    private fun setLanguages(languages: List<Language>) {
        _languagesUiState.update {
                currentState ->
            currentState.copy(
                languagesList = languages.toMutableStateList()
            )
        }
    }

    private fun setWords(words: List<Word>) {
        _languagesUiState.update {
            currentState ->
            currentState.copy(
                wordsList = words.toMutableStateList()
            )
        }
    }

    fun setCurrentLanguage(language: Language?) {
        _languagesUiState.update {
            currentState ->
            currentState.copy(
                currentLanguage = language
            )
        }
    }

    fun setVocable(vocable: String) {
        _languagesUiState.update {
            currentState ->
            currentState.copy(
                word = _languagesUiState.value.word.copy(vocable = vocable)
            )
        }
    }

    fun setWordLanguage(language: Language) {
        _languagesUiState.update {
                currentState ->
            currentState.copy(
                word = _languagesUiState.value.word.copy(language = language)
            )
        }
    }

    fun resetWord() {
        _languagesUiState.update {
                currentState ->
            currentState.copy(
                word = Word(
                    0,
                    _languagesUiState.value.languagesList[0],
                    ""
                )
            )
        }
    }

    fun handleWord() {
        val word = _languagesUiState.value.word
        if (word.id == 0) createWord() else updateWordToServer()
    }

    private fun createWord() {
        DataManager.addWord(
            _languagesUiState.value.word,
            object: Callback<Word> {
                override fun onResponse(call: Call<Word>, response: Response<Word>) {
                    if (response.isSuccessful) {
                        addWord(response.body()!!)
                        Log.d("ADD WORD", "Word successfully added")
                    }
                }

                override fun onFailure(call: Call<Word>, t: Throwable) {
                    Log.e("ADD WORD", "Error adding word", t)
                }
            }
        )
    }

    private fun addWord(word: Word) {
        _languagesUiState.value.wordsList.add(word)
    }

    private fun updateWordToServer() {
        DataManager.updateWord(
            _languagesUiState.value.word,
            object: Callback<Word> {
                override fun onResponse(call: Call<Word>, response: Response<Word>) {
                    if (response.isSuccessful) {
                        updateWord(response.body()!!)
                        Log.d("UPDATE WORD", "Word successfully updated")
                    }
                }

                override fun onFailure(call: Call<Word>, t: Throwable) {
                    Log.e("UPDATE WORD", "Error updating word", t)
                }
            }
        )
    }

    private fun updateWord(word: Word) {
        val id = _languagesUiState.value.wordsList.indexOfFirst { it.id == word.id }
        _languagesUiState.value.wordsList[id] = word
    }

    fun setWord(word: Word) {
        _languagesUiState.update {
                currentState ->
            currentState.copy(
                word = word
            )
        }
    }
}