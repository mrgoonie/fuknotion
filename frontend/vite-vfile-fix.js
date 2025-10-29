import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vite plugin to resolve Node.js subpath imports from vfile package
export function vfileSubpathFix() {
  const vfilePath = path.resolve(__dirname, 'node_modules', 'vfile')

  return {
    name: 'vfile-subpath-fix',
    resolveId(source, importer) {
      // Only resolve if import is from vfile
      if (!importer || !importer.includes('vfile')) {
        return null
      }

      // Resolve #minpath import from vfile
      if (source === '#minpath') {
        return path.join(vfilePath, 'lib', 'minpath.browser.js')
      }
      // Resolve #minproc import from vfile
      if (source === '#minproc') {
        return path.join(vfilePath, 'lib', 'minproc.browser.js')
      }
      // Resolve #minurl import from vfile
      if (source === '#minurl') {
        return path.join(vfilePath, 'lib', 'minurl.browser.js')
      }
      return null
    }
  }
}
