package at.htlvillach.translationmgmt.ui

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.snapshots.SnapshotStateList
import at.htlvillach.translationmgmt.model.Language
import at.htlvillach.translationmgmt.model.Word

data class LanguagesUIState (
    val languagesList: SnapshotStateList<Language> = mutableStateListOf(),
    val wordsList: SnapshotStateList<Word> = mutableStateListOf(),
    var currentLanguage: Language? = null,
    var word: Word = Word(0, Language(0, ""), "")
) {
}