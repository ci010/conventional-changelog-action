import { getInput, info, setFailed, setOutput } from '@actions/core'
import * as conventionalCommitsConfig from 'conventional-changelog-conventionalcommits'
import * as conventionalChangelog from 'conventional-changelog-core'
import { Options } from 'conventional-changelog-core'
import * as conventionalRecommendedBump from 'conventional-recommended-bump'
import { resolve } from 'path'
import { inc } from 'semver'

/**
 * Generates a string changelog
 */
function generateStringChangelog(options: Options, version?: string) {
  return new Promise<string>((resolve, reject) => {
    const changelogStream = conventionalChangelog(options, { version })

    let changelog = ''

    changelogStream
      .on('data', (data) => {
        changelog += data.toString()
      })
      .on('end', () => resolve(changelog))
  })
}

async function run() {
  try {
    const version = getInput('version')
    const tagPrefix = getInput('tag-prefix')
    const conventionalConfigFile = getInput('config-file-path')

    info(`Using "${version}" as version`)
    info(`Using "${tagPrefix}" as tag prefix`)
    info(`Using "${conventionalConfigFile}" as config file`)

    const config: Options.Config.Object = (conventionalConfigFile && require(resolve(process.cwd(), conventionalConfigFile))) || conventionalCommitsConfig;

    conventionalRecommendedBump({ tagPrefix, config }, async (error, recommendation) => {
      if (error) {
        setFailed(error.message)
        return
      }

      info(`Recommended release type: ${recommendation.releaseType}`)

      // If we have a reason also log it
      if (recommendation.reason) {
        info(`Because: ${recommendation.reason}`)
      }

      const options: Options = {
        config,
        tagPrefix,
      }

      const newVersion = version ? inc(version, recommendation.releaseType) : undefined

      // Generate the string changelog
      const stringChangelog = await generateStringChangelog(options, newVersion)
      info('Changelog generated')
      info(stringChangelog)

      // Removes the version number from the changelog
      const cleanChangelog = stringChangelog.split('\n').slice(3).join('\n').trim()

      if (cleanChangelog === '') {
        info('Generated changelog is empty and skip-on-empty has been activated so we skip this step')
        setOutput('skipped', 'true')
        return
      }

      if (newVersion) {
        info(`New version: ${newVersion}`)
        const tag = `${tagPrefix}${newVersion}`
        setOutput('tag', tag)
        setOutput('version', newVersion)
      } else {
        info(`No new version generated`)
        setOutput('tag', '')
        setOutput('version', '')
      }
      
      // Set outputs so other actions (for example actions/create-release) can use it
      setOutput('changelog', stringChangelog)
      setOutput('clean_changelog', cleanChangelog)
      setOutput('skipped', 'false')
    })
  } catch (error) {
    setFailed(error.message)
  }
}

run()
