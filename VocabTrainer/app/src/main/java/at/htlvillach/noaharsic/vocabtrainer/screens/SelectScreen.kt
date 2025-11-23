package at.htlvillach.noaharsic.vocabtrainer.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import at.htlvillach.noaharsic.vocabtrainer.ui.VocabViewModel
import at.htlvillach.noaharsic.vocabtrainer.ui.util.Dropdown

@Composable
fun SelectScreen(
    vocabViewModel: VocabViewModel = viewModel(),
    onSelected: () -> Unit,
) {
    val uiState by vocabViewModel.vocabUiState.collectAsState()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            "Vocabulary Trainer",
            modifier = Modifier
                .padding(bottom = 32.dp)
                .fillMaxWidth(),
            style = MaterialTheme.typography.headlineLarge,
            textAlign = TextAlign.Center,
        )
        Row (
            modifier = Modifier
                .padding(start = 16.dp, end = 16.dp, bottom = 16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("From:",
                modifier = Modifier
                    .padding(end = 8.dp)
            )
            Dropdown(
                uiState.languageList,
                vocabViewModel::setFromLanguage,
                uiState.from,
                allowDefault = false
            )
        }
        Row (
            modifier = Modifier
                .padding(start = 16.dp, end = 16.dp, bottom = 16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("To:",
                modifier = Modifier.padding(end = 8.dp)
            )
            Dropdown(
                uiState.languageList,
                vocabViewModel::setToLanguage,
                uiState.to,
                allowDefault = false
            )
        }
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            TextButton(
                onClick = {
                    vocabViewModel.setTranslations()
                    onSelected()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                ),
                content = {
                    Text("Go")
                },
                modifier = Modifier.width(90.dp)
            )
        }
    }
}