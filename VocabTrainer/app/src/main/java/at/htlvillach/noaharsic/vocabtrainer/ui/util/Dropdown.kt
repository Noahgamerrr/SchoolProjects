package at.htlvillach.noaharsic.vocabtrainer.ui.util

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import at.htlvillach.noaharsic.vocabtrainer.model.Language

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Dropdown(
    languages: List<Language>,
    onClick: (Language?) -> Unit,
    language: Language?,
    allowDefault: Boolean = true
) {
    var expanded by remember {
        mutableStateOf(false)
    }

    Column (
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        ExposedDropdownMenuBox(
            modifier = Modifier
                .padding()
                .width(200.dp)
                .clip(RoundedCornerShape(10.dp)),
            expanded = expanded,
            onExpandedChange = {
                expanded = !expanded
            }
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    modifier = Modifier.menuAnchor(),
                    value = language?.identifier ?: "Select Language",
                    onValueChange = { },
                    readOnly = true,
                    trailingIcon = {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                    }
                )
            }

            ExposedDropdownMenu(expanded = expanded,
                onDismissRequest = {
                    expanded = false
                }
            ) {
                if (allowDefault)
                    DropdownMenuItem(
                        text = {
                            Text("Select Language")
                        },
                        onClick = {
                            onClick(null)
                            expanded = false
                        },
                        contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
                    )
                languages.forEachIndexed { index, item ->
                    DropdownMenuItem(
                        text = {
                            Text(item.identifier)
                        },
                        onClick = {
                            onClick(languages.getOrNull(index))
                            expanded = false
                        },
                        contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
                    )
                }
            }
        }
    }
}