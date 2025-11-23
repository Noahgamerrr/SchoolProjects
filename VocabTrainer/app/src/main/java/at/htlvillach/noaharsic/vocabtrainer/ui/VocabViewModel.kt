package at.htlvillach.noaharsic.vocabtrainer.ui

import android.util.Log
import androidx.compose.runtime.toMutableStateList
import androidx.lifecycle.ViewModel
import at.htlvillach.noaharsic.vocabtrainer.dal.DataManager
import at.htlvillach.noaharsic.vocabtrainer.dal.OfflineDataProvider
import at.htlvillach.noaharsic.vocabtrainer.model.Language
import at.htlvillach.noaharsic.vocabtrainer.model.Translation
import at.htlvillach.noaharsic.vocabtrainer.model.Word
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class VocabViewModel: ViewModel() {
    private val _vocabUiState = MutableStateFlow(VocabUiState())
    val vocabUiState: StateFlow<VocabUiState> = _vocabUiState

    init {
        if (_vocabUiState.value.languageList.isEmpty()) loadLanguages()
        if (_vocabUiState.value.wordList.isEmpty()) loadWords()
    }

    private fun loadLanguages() {
        DataManager.getLanguages(object: Callback<List<Language>> {
            override fun onResponse(call: Call<List<Language>>, response: Response<List<Language>>) {
                if (response.isSuccessful) {
                    setLanguages(response.body()!!)
                    setFromLanguage(_vocabUiState.value.languageList[0])
                    setToLanguage(_vocabUiState.value.languageList[1])
                    Log.d("LANGUAGES", _vocabUiState.value.languageList.size.toString())
                } else loadOfflineData()
            }

            override fun onFailure(call: Call<List<Language>>, t: Throwable) {
                Log.e("LANGUAGES", "Error loading languages", t)
                loadOfflineData()
            }
        })
    }

    private fun loadWords() {
        DataManager.getWords(object: Callback<List<Word>> {
            override fun onResponse(call: Call<List<Word>>, response: Response<List<Word>>) {
                if (response.isSuccessful) {
                    setWords(response.body()!!)
                    Log.d("WORDS", _vocabUiState.value.wordList.size.toString())
                } else loadOfflineData()
            }

            override fun onFailure(call: Call<List<Word>>, t: Throwable) {
                Log.e("WORDS", "Error loading languages", t)
                loadOfflineData()
            }
        })
    }

    private fun loadTranslations() {
        DataManager.getTranslations(object: Callback<List<Translation>> {
                override fun onResponse(call: Call<List<Translation>>, response: Response<List<Translation>>) {
                    if (response.isSuccessful) {
                        _vocabUiState.update {
                            it.copy(translationList = response.body()!!.toMutableStateList())
                        }
                        Log.d("TRANSLATIONS", _vocabUiState.value.translationList.size.toString())

                    }
                }

                override fun onFailure(call: Call<List<Translation>>, t: Throwable) {
                    Log.e("TRANSLATIONS", "Error loading translations", t)
                }
            },
            _vocabUiState.value.from!!.id,
            _vocabUiState.value.to!!.id
        )
    }

    private fun loadOfflineData() {
        setIsOffline()
        setLanguages(OfflineDataProvider.languageList)
        setFromLanguage(OfflineDataProvider.languageList[0])
        setToLanguage(OfflineDataProvider.languageList[1])
        setWords(OfflineDataProvider.wordList)
    }

    private fun setIsOffline() {
        _vocabUiState.update {
            it.copy(isOnline = false)
        }
    }

    private fun setLanguages(languages: List<Language>) {
        _vocabUiState.update {
             it.copy(
                languageList = languages.toMutableStateList()
            )
        }
    }

    fun setTranslations() {
        if (_vocabUiState.value.isOnline) {
            loadTranslations()
        } else {
            val uiState = _vocabUiState.value
            val translations = OfflineDataProvider.translationList.filter{
                it.toTranslate.language.id == uiState.from!!.id &&
                it.translated.language.id == uiState.to!!.id
            }.toMutableStateList()
            _vocabUiState.update {
                it.copy(translationList = translations)
            }
        }
    }

    fun setFromLanguage(language: Language?) {
        _vocabUiState.update {
            it.copy(from = language)
        }
    }

    fun setToLanguage(language: Language?) {
        _vocabUiState.update {
            it.copy(to = language)
        }
    }

    fun setWords(words: List<Word>) {
        _vocabUiState.update {
            it.copy(wordList = words.toMutableStateList())
        }
    }

    fun setGuess(guess: String) {
        _vocabUiState.update {
            it.copy(guess = guess)
        }
    }

    fun checkGuess(): Boolean {
        val uiState = _vocabUiState.value
        val currentWord = uiState.wordList[uiState.currentIndex]
        val translation = uiState.translationList
            .find{
                it.toTranslate.id == currentWord.id &&
                it.translated.vocable == uiState.guess
            }
        return translation != null
    }

    fun getTranslations(): List<String> {
        val uiState = _vocabUiState.value
        val currentWord = uiState.wordList[uiState.currentIndex]
        return uiState.translationList
            .filter {
                it.toTranslate.id == currentWord.id
            }
            .map{it.translated.vocable}
    }

    fun setNextWord() {
        _vocabUiState.update {
            it.copy(
                currentIndex = (it.currentIndex + 1) % it.wordList.size,
                guess = ""
            )
        }
    }
}