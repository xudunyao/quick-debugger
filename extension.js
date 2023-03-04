// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(bug)';
    statusBarItem.show();
    statusBarItem.command = 'extension.debug';
    context.subscriptions.push(vscode.commands.registerCommand('extension.debug', () => {
      statusBarItem.text === '$(bug)' ?  statusBarItem.text = '$(debug-stop)' :  statusBarItem.text = '$(bug)';
    }));
    vscode.debug.onDidChangeBreakpoints((e)=>{
        if(statusBarItem.text === '$(debug-stop)') return ;
        let editor = vscode.window.activeTextEditor;
        let position = editor.selection.active;
        let line = editor.document.lineAt(position.line);
        if(e.added.length>0){
            line = editor.document.lineAt(e.added[0].location.range.start.line);
            if(line.text.indexOf('debugger')>-1){
                return;
            }
            editor.edit((editBuilder)=>{
                editBuilder.insert(line.range.start,'\tdebugger;\r');
            });
        }else{
            let line = editor.document.lineAt(e.removed[0].location.range.start.line);
            let text = line.text;
            if(text.indexOf('debugger')>-1){
              editor.edit((editBuilder)=>{
                  editBuilder.delete(line.rangeIncludingLineBreak);
              });
          }
        }
        editor.document.save();
    });
}
  
// This method is called when your extension is deactivated
function deactivate() {

}

module.exports = {
    activate,
    deactivate
}