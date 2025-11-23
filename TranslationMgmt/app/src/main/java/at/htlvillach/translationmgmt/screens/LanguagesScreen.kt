package at.htlvillach.translationmgmt.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import at.htlvillach.translationmgmt.model.Language
import at.htlvillach.translationmgmt.ui.LanguagesViewModel

@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun LanguagesScreen(
    languagesViewModel: LanguagesViewModel = viewModel(),
) {
    Scaffold (
        floatingActionButton = {
            FloatingActionButton(
                onClick = {}
            ) {
                Icon(imageVector = Icons.Filled.Add, contentDescription = "Add")
            }
        }
    ) {
        val uiState by languagesViewModel.languagesUIState.collectAsState()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                "Languages",
                modifier = Modifier.padding(bottom = 32.dp),
                style = MaterialTheme.typography.headlineLarge
            )
            Surface (
                modifier = Modifier
                    .fillMaxSize(0.5f),
                color = MaterialTheme.colorScheme.outlineVariant,
                shape = MaterialTheme.shapes.large
            ) {
                LazyColumn (
                    modifier = Modifier.padding(16.dp)
                ) {
                    val lastIdx = uiState.languagesList.lastIndex
                    itemsIndexed(uiState.languagesList) {
                        idx, language -> LanguageRow(idx, language, lastIdx)
                    }
                }
            }
        }
    }
}

@Composable
fun LanguageRow(idx: Int, language: Language, lastIdx: Int) {
    Row (
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            language.identifier,
            style = MaterialTheme.typography.headlineSmall,
        )
        Button(
            onClick = {},
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer
            )
        ) {
            Icon(Icons.Outlined.Delete, contentDescription = null)
        }
    }
    if (idx < lastIdx) {
        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
    }
}