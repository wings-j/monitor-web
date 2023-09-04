import RollupPluginTypescript from '@rollup/plugin-typescript'
import RollupPluginDelete from 'rollup-plugin-delete'
import PackageJson from './package.json' assert { type: 'json' }

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: PackageJson.main
    },
    {
      file: 'test/index.js'
    }
  ],
  plugins: [RollupPluginDelete(), RollupPluginTypescript()]
}

export default config
