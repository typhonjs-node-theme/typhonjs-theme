import fs   from 'fs';
import path from 'path';

/**
 * Provides a base CSS theme implementation for `typhonjs-theme-engine`.
 */
export default class Theme
{
   /**
    * Instantiates Theme.
    */
   constructor()
   {
      this._resources = { append: [], copy: [], prepend: [] };
      this._themeDirNames = [];
   }

   /**
    * Wires up Theme on the plugin eventbus.
    *
    * @param {PluginEvent} ev - The plugin event.
    */
   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      this._eventbus.on('typhonjs:theme:css:get', this.getThemeCSS, this);
      this._eventbus.on('typhonjs:theme:resources:get', this.getThemeResources, this);
   }

   /**
    * Adds an absolute path to the list of theme paths.
    *
    * @param {string}   dirName - The absolute directory to resolve.
    */
   addThemeDirName({ dirName } = {})
   {
      if (typeof dirName !== 'string') { throw new Error(`'dirName' is not a 'string'.`); }
      if (!fs.existsSync(dirName)) { throw new Error(`Could not resolve theme directory: ${dirName}.`); }

      this._themeDirNames.push(dirName);
   }

   /**
    * Adds a CSS resource to be appended or prepended. The other option marking a local resource to be copied.
    *
    * @param {string}   action - `append`, `copy` or `prepend`.
    *
    * @param {string}   dirName - The absolute directory to resolve.
    *
    * @param {string}   filePath - The relative file path to resolve.
    *
    * @param {string}   [name='styles.css'] - Name of CSS entry to modify.
    */
   addThemeResource({ action, dirName, filePath, name = 'styles.css' } = {})
   {
      if (typeof action !== 'string') { throw new Error(`'action' is not a 'string'.`); }
      if (typeof dirName !== 'string') { throw new Error(`'dirName' is not a 'string'.`); }
      if (typeof filePath !== 'string') { throw new Error(`'localPath' is not a 'string'.`); }
      if (typeof name !== 'string') { throw new Error(`'name' is not a 'string'.`); }

      const fullPath =  path.resolve(dirName, filePath);

      if (!fs.existsSync(fullPath)) { throw new Error(`Could not resolve theme resource file path: ${fullPath}.`); }

      switch (action)
      {
         case 'append':
            this._resources.append.push({ name, dirName, filePath, fullPath });
            break;

         case 'copy':
            this._resources.copy.push({ name, dirName, filePath, fullPath });
            break;

         case 'prepend':
            this._resources.prepend.push({ name, dirName, filePath, fullPath });
            break;

         default:
            throw new Error(`Unknown 'action' type: '${action}'`);
      }
   }

   /**
    * Attempts to resolve a theme CSS matching a structural CSS addition. All of the registered theme directory names
    * will be traversed looking for a matching file path.
    *
    * @param {string}   [name='styles.css'] - Name of CSS entry to modify.
    *
    * @param {string}   filePath - The relative CSS file path to resolve.
    *
    * @param {boolean}  [silent=false] - When true any logging is skipped.
    *
    * @returns {{name: string, dirName: string, filePath: string, fullPath: string}}
    */
   async getThemeCSS({ name = void 0, filePath = void 0, silent = false } = {})
   {
      if (typeof name !== 'string') { throw new Error(`'name' is not a 'string'.`); }
      if (typeof filePath !== 'string') { throw new Error(`'filePath' is not a 'string'.`); }
      if (typeof silent !== 'boolean') { throw new Error(`'silent' is not a 'boolean'.`); }

      const themeCSS = [];

      for (const dirName of this._themeDirNames)
      {
         const fullPath = path.resolve(dirName, filePath);

         if (fs.existsSync(fullPath))
         {
            themeCSS.push({ name, dirName, filePath, fullPath, silent });
         }
      }

      return themeCSS;
   }

   /**
    * Gets any collected additional theme resources.
    *
    * @returns {object}
    */
   async getThemeResources()
   {
      return this._resources;
   }
}
