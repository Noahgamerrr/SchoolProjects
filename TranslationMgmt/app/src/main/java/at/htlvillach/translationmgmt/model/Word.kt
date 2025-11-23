package at.htlvillach.translationmgmt.model

data class Word (
    val id: Int,
    val language: Language,
    val vocable: String,
)