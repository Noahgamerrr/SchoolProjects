package at.htlvillach.noaharsic.vocabtrainer.screens

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.material3.TopAppBarDefaults.topAppBarColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.createGraph
import at.htlvillach.noaharsic.vocabtrainer.ui.VocabViewModel
import at.htlvillach.noaharsic.vocabtrainer.ui.navigation.Screen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    modifier: Modifier,
    viewModel: VocabViewModel = viewModel()
) {
    val navController = rememberNavController()
    Scaffold (
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                colors = topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary,
                ),
                title = {
                    Text(text = "Vocab Trainer")
                }
            )
        }
    ) { innerPadding ->
        val graph = navController.createGraph(startDestination = Screen.SelectLanguage.route) {
            composable(Screen.SelectLanguage.route) {
                SelectScreen(
                    viewModel,
                ) { navController.navigate(Screen.VocabTrainer.route) }
            }
            composable(Screen.VocabTrainer.route) {
                VocabScreen(viewModel)
            }
        }
        NavHost(
            navController = navController,
            graph = graph,
            modifier = modifier.padding(innerPadding),
        )
    }
}