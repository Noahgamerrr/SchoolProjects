package at.htlvillach.noaharsic.vocabtrainer.model

data class Translation (
    val id: Int,
    val toTranslate: Word,
    val translated: Word
)