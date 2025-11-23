package at.htlvillach.noaharsic.vocabtrainer.dal

import at.htlvillach.noaharsic.vocabtrainer.model.Language
import at.htlvillach.noaharsic.vocabtrainer.model.Translation
import at.htlvillach.noaharsic.vocabtrainer.model.Word

object OfflineDataProvider {
    val languageList: List<Language> =
        listOf(
            Language(1, "German"),
            Language(2, "English"),
            Language(3, "Italian"),
        )

    val wordList: List<Word> =
        listOf(
            Word(1, languageList[0], "Haus"),
            Word(2, languageList[0], "Ferien"),
            Word(3, languageList[0], "Schule"),
            Word(4, languageList[0], "laufen"),
            Word(5, languageList[1], "house"),
            Word(6, languageList[1], "holidays"),
            Word(7, languageList[1], "school"),
            Word(8, languageList[1], "to run"),
            Word(9, languageList[2], "casa"),
            Word(10, languageList[2], "vacanza"),
            Word(11, languageList[2], "ferie"),
            Word(12, languageList[2], "scuola"),
            Word(13, languageList[2], "correre"),
            Word(14, languageList[2], "camminare"),
        )

    val translationList: List<Translation> =
        listOf(
            Translation(1, wordList[0], wordList[4]),
            Translation(2, wordList[0], wordList[8]),
            Translation(3, wordList[1], wordList[5]),
            Translation(4, wordList[1], wordList[9]),
            Translation(5, wordList[1], wordList[10]),
            Translation(6, wordList[2], wordList[6]),
            Translation(7, wordList[2], wordList[11]),
            Translation(8, wordList[3], wordList[7]),
            Translation(9, wordList[3], wordList[12]),
            Translation(10, wordList[3], wordList[13]),
            Translation(11, wordList[4], wordList[0]),
            Translation(12, wordList[8], wordList[0]),
            Translation(13, wordList[5], wordList[1]),
            Translation(14, wordList[9], wordList[1]),
            Translation(15, wordList[10], wordList[1]),
            Translation(16, wordList[6], wordList[2]),
            Translation(17, wordList[11], wordList[2]),
            Translation(18, wordList[7], wordList[2]),
            Translation(19, wordList[12], wordList[3]),
            Translation(20, wordList[13], wordList[3])
        )
}