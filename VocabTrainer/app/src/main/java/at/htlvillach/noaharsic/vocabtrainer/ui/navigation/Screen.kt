package at.htlvillach.noaharsic.vocabtrainer.ui.navigation

sealed class Screen (val route: String) {
    object SelectLanguage: Screen("SelectLanguage")
    object VocabTrainer: Screen("VocabTrainer")
}