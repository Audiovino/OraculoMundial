/**
 * Obsidian Context Handoff Plugin
 * Automatiza la visualización y carga de sesiones guardadas
 * 
 * Instalación:
 * 1. Copiar este archivo a: C:\Proyectos\Propgear-AI\Propgear-Notas\.obsidian\plugins\context-handoff\main.js
 * 2. Recargar Obsidian
 * 3. Activar el plugin en Settings → Community Plugins
 */

const obsidian = require('obsidian');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ContextHandoffPlugin extends obsidian.Plugin {
    async onload() {
        console.log('Loading Context Handoff Plugin');
        
        // Agregar comando para guardar contexto
        this.addCommand({
            id: 'save-context-to-obsidian',
            name: 'Save Context to Obsidian',
            callback: () => this.saveContext()
        });
        
        // Agregar comando para cargar contexto
        this.addCommand({
            id: 'load-context-from-obsidian',
            name: 'Load Context from Obsidian',
            callback: () => this.loadContext()
        });
        
        // Agregar comando para ver sesiones
        this.addCommand({
            id: 'list-context-sessions',
            name: 'List Context Sessions',
            callback: () => this.listSessions()
        });
        
        // Agregar ribbon icon
        this.addRibbonIcon('save', 'Save Context', () => this.saveContext());
        
        // Crear vista personalizada
        this.registerView('context-sessions', (leaf) => new ContextSessionsView(leaf));
        
        // Agregar comando para abrir vista
        this.addCommand({
            id: 'open-context-sessions-view',
            name: 'Open Context Sessions View',
            callback: () => this.openSessionsView()
        });
    }
    
    async saveContext() {
        const workspace = 'c:\\Proyectos\\OraculoMundial';
        const command = `cd ${workspace} && .\\scripts\\context-saver.ps1 -SessionName 'obsidian-$(Get-Date -Format yyyy-MM-dd-HHmm)'`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                new obsidian.Notice(`❌ Error: ${error.message}`);
                return;
            }
            new obsidian.Notice('✅ Context guardado en Obsidian');
            console.log(stdout);
        });
    }
    
    async loadContext() {
        const sessionDir = 'C:\\Proyectos\\Propgear-AI\\Propgear-Notas\\Sesiones-Kiro';
        
        try {
            const files = fs.readdirSync(sessionDir)
                .filter(f => f.endsWith('.md'))
                .sort()
                .reverse();
            
            if (files.length === 0) {
                new obsidian.Notice('No sessions found');
                return;
            }
            
            // Mostrar selector de sesiones
            const options = files.map(f => ({
                label: f.replace('.md', ''),
                value: f
            }));
            
            // Crear modal para seleccionar sesión
            const modal = new SessionSelectorModal(this.app, options, (selected) => {
                const command = `cd c:\\Proyectos\\OraculoMundial && .\\scripts\\context-loader.ps1 -SessionName '${selected.replace('.md', '')}'`;
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        new obsidian.Notice(`❌ Error: ${error.message}`);
                        return;
                    }
                    new obsidian.Notice('✅ Context cargado');
                    console.log(stdout);
                });
            });
            
            modal.open();
        } catch (error) {
            new obsidian.Notice(`❌ Error: ${error.message}`);
        }
    }
    
    async listSessions() {
        const sessionDir = 'C:\\Proyectos\\Propgear-AI\\Propgear-Notas\\Sesiones-Kiro';
        
        try {
            const files = fs.readdirSync(sessionDir)
                .filter(f => f.endsWith('.md'))
                .sort()
                .reverse()
                .slice(0, 10);
            
            let content = '# Context Sessions\n\n';
            
            files.forEach((file, index) => {
                const filePath = path.join(sessionDir, file);
                const stats = fs.statSync(filePath);
                const date = new Date(stats.mtime).toLocaleString();
                
                content += `${index + 1}. **${file.replace('.md', '')}**\n`;
                content += `   - Guardada: ${date}\n`;
                content += `   - Tamaño: ${(stats.size / 1024).toFixed(2)} KB\n\n`;
            });
            
            // Crear nota temporal
            const leaf = this.app.workspace.getLeaf();
            const file = await this.app.vault.create('Context-Sessions-List.md', content);
            await leaf.openFile(file);
        } catch (error) {
            new obsidian.Notice(`❌ Error: ${error.message}`);
        }
    }
    
    async openSessionsView() {
        const leaf = this.app.workspace.getRightLeaf(false);
        await leaf.setViewState({
            type: 'context-sessions',
            active: true
        });
    }
    
    onunload() {
        console.log('Unloading Context Handoff Plugin');
    }
}

class ContextSessionsView extends obsidian.ItemView {
    constructor(leaf) {
        super(leaf);
    }
    
    getViewType() {
        return 'context-sessions';
    }
    
    getDisplayText() {
        return 'Context Sessions';
    }
    
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        
        const sessionDir = 'C:\\Proyectos\\Propgear-AI\\Propgear-Notas\\Sesiones-Kiro';
        
        try {
            const files = fs.readdirSync(sessionDir)
                .filter(f => f.endsWith('.md'))
                .sort()
                .reverse()
                .slice(0, 10);
            
            const div = container.createDiv();
            div.createEl('h2', { text: '📂 Context Sessions' });
            
            files.forEach((file) => {
                const filePath = path.join(sessionDir, file);
                const stats = fs.statSync(filePath);
                const date = new Date(stats.mtime).toLocaleString();
                
                const item = div.createDiv({ cls: 'context-session-item' });
                item.createEl('strong', { text: file.replace('.md', '') });
                item.createEl('br');
                item.createEl('small', { text: `📅 ${date}` });
                item.createEl('br');
                item.createEl('small', { text: `📊 ${(stats.size / 1024).toFixed(2)} KB` });
                
                const button = item.createEl('button', { text: 'Load' });
                button.onclick = () => {
                    const command = `cd c:\\Proyectos\\OraculoMundial && .\\scripts\\context-loader.ps1 -SessionName '${file.replace('.md', '')}'`;
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        console.log(stdout);
                    });
                };
            });
        } catch (error) {
            container.createEl('p', { text: `❌ Error: ${error.message}` });
        }
    }
    
    async onClose() {
        // Cleanup
    }
}

class SessionSelectorModal extends obsidian.Modal {
    constructor(app, options, onSelect) {
        super(app);
        this.options = options;
        this.onSelect = onSelect;
    }
    
    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Select Session' });
        
        this.options.forEach((option) => {
            const button = contentEl.createEl('button', { text: option.label });
            button.onclick = () => {
                this.onSelect(option.value);
                this.close();
            };
        });
    }
    
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

module.exports = ContextHandoffPlugin;
