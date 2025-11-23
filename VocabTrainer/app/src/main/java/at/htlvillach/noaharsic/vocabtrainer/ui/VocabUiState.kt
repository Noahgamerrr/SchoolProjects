package at.htlvillach.noaharsic.vocabtrainer.ui

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.snapshots.SnapshotStateList
import at.htlvillach.noaharsic.vocabtrainer.model.Language
import at.htlvillach.noaharsic.vocabtrainer.model.Translation
import at.htlvillach.noaharsic.vocabtrainer.model.Word

data class VocabUiState(
    val languageList: SnapshotStateList<Language> = mutableStateListOf(),
    val from: Language? = null,
    val to: Language? = null,
    val wordList: SnapshotStateList<Word> = mutableStateListOf(),
    val isOnline: Boolean = true,
    val currentIndex: Int = 0,
    val guess: String = "",
    val translationList: SnapshotStateList<Translation> = mutableStateListOf()
)