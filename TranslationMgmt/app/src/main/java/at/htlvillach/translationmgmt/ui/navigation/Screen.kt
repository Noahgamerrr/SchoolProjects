package at.htlvillach.translationmgmt.ui.navigation

sealed class Screen (val route: String) {
    object Languages: Screen("languages_screen")
    object Words: Screen("words_screen")
    object Assignment: Screen("assignment_screen")
}