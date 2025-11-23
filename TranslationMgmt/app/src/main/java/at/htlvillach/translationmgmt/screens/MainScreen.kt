package at.htlvillach.translationmgmt.screens

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.createGraph
import at.htlvillach.translationmgmt.ui.LanguagesViewModel
import at.htlvillach.translationmgmt.ui.navigation.BottomNavigationBar
import at.htlvillach.translationmgmt.ui.navigation.Screen

@Composable
fun MainScreen(
    modifier: Modifier,
    viewModel: LanguagesViewModel = viewModel()
) {
    val navController = rememberNavController()
    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            BottomNavigationBar(navController = navController)
        }
    ) {
        innerPadding ->
        val graph = navController.createGraph(startDestination = Screen.Languages.route) {
            composable(Screen.Words.route) {
                WordsScreen(viewModel)
            }
            composable(Screen.Languages.route) {
                LanguagesScreen(viewModel)
            }
            composable(Screen.Assignment.route) {
                AssignmentsScreen()
            }
        }
        NavHost(
            navController = navController,
            graph = graph,
            modifier = modifier.padding(innerPadding),
        )
    }
}