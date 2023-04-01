// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBarItem.text = '$(bug)'
  statusBarItem.show()
  statusBarItem.command = 'extension.debug'
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.debug', () => {
      if(statusBarItem.text === '$(debug-stop)') {
        statusBarItem.text = '$(bug)';
      } else {
        statusBarItem.text = '$(debug-stop)';
      }
    })
  )
  vscode.debug.onDidChangeBreakpoints((e) => {
    if (statusBarItem.text === '$(debug-stop)') return
    let editor = vscode.window.activeTextEditor
    let position = editor.selection.active
    let line = editor.document.lineAt(position.line)
    if (e.added.length > 0) {
      line = editor.document.lineAt(e.added[0].location.range.start.line)
      if (line.text.indexOf('debugger') > -1) {
        return
      }
      editor.edit((editBuilder) => {
        let text = line.text
        let reg = /^\s*/
        let result = text.match(reg)
        editBuilder.insert(line.range.start, `${result[0]}debugger;\r`)
      })
    } else {
      let line = editor.document.lineAt(e.removed[0].location.range.start.line)
      let text = line.text
      if (text.indexOf('debugger') > -1) {
        editor.edit((editBuilder) => {
          editBuilder.delete(line.rangeIncludingLineBreak)
        })
      }
    }
    editor.document.save()
  })
  context.subscriptions.push(
    vscode.commands.registerCommand('quick-debugger.deleteLog', (range) => {
      let editor = vscode.window.activeTextEditor;
      let reg = /console\.log\((.*?)\);?/g
      let text = editor.document.getText(range)
      let result = text.replace(reg, '')
      editor.edit((editBuilder) => {
        editBuilder.replace(range, result)
      })
    })
  )
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file'},
      {
        provideCodeLenses(document, token) {
          let codeLenses = [];
          let reg = /console\.log\((.*?)\);?/g
          for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i)
            if (line.text.match(reg)) {
              let range = new vscode.Range(
                line.range.start,
                line.range.end
              )
              codeLenses.push(
                new vscode.CodeLens(range, {
                  title: 'delete',
                  command: 'quick-debugger.deleteLog',
                  arguments: [range],
                })
              )
            }
          }
          return codeLenses
        },
        resolveCodeLens(codeLens, token) {
          codeLens.command = {
            title: 'delete',
            command: 'quick-debugger.deleteLog',
            arguments: [codeLens.range],
          }
          return codeLens
        }
      }
    )
  )
}
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
