// Script to convert FontAwesome Pro icons to Iconify JSON format
// This script is ready to use once you have your FontAwesome Pro token

// Instructions:
// 1. Get FontAwesome Pro token from https://fontawesome.com/
// 2. Configure npm: npm config set @fortawesome:registry https://npm.fontawesome.com/ && npm config set //npm.fontawesome.com/:_authToken YOUR_TOKEN
// 3. Install packages: pnpm add -D @fortawesome/pro-duotone-svg-icons @fortawesome/pro-light-svg-icons @fortawesome/pro-regular-svg-icons @fortawesome/pro-solid-svg-icons @fortawesome/pro-thin-svg-icons
// 4. Uncomment the imports and code below
// 5. Run: deno task convert-fa-pro

// Reference: https://iconify.design/docs/libraries/tools/examples/import-fa-pro.html#using-the-fontawesome-pro-npm-libraries

/*
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// import the fonts you want to convert
import {
  fad as faProDuotoneIcons,
  prefix as faProDuotonePrefix,
} from '@fortawesome/pro-duotone-svg-icons';
import {
  fal as faProLightIcons,
  prefix as faProLightPrefix,
} from '@fortawesome/pro-light-svg-icons';
import {
  far as faProRegularIcons,
  prefix as faProRegularPrefix,
} from '@fortawesome/pro-regular-svg-icons';
import {
  fas as faProSolidIcons,
  prefix as faProSolidPrefix,
} from '@fortawesome/pro-solid-svg-icons';
import { fat as faProThinIcons, prefix as faProThinPrefix } from '@fortawesome/pro-thin-svg-icons';
import { blankIconSet } from '@iconify/tools';
import type { IconifyInfo } from '@iconify/types';

// put the icons and the prefix you want them to have together in one object.
const icons = [
  {
    icons: faProDuotoneIcons,
    prefix: faProDuotonePrefix,
  },
  {
    icons: faProLightIcons,
    prefix: faProLightPrefix,
  },
  {
    icons: faProRegularIcons,
    prefix: faProRegularPrefix,
  },
  {
    icons: faProSolidIcons,
    prefix: faProSolidPrefix,
  },
  {
    icons: faProThinIcons,
    prefix: faProThinPrefix,
  },
] as const;

// set the location where you want the generated json files to appear.
const collectionTargetDir: string = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'app',
  'icons'
);

// set the base info
const baseInfo: IconifyInfo = {
  author: {
    name: 'Font Awesome',
  },
  height: 512,
  license: {
    title: 'Commercial License',
    url: 'https://fontawesome.com/license',
  },
  name: 'Font Awesome',
} as const;

// iterate through the icons and generate the json files
for (const iconData of icons) {
  const iconSet = blankIconSet(iconData.prefix);
  iconSet.info = structuredClone(baseInfo);

  for (const [_iconName, iconValue] of Object.entries(iconData.icons)) {
    const { icon, iconName: name } = iconValue as {
      icon: [
        number,
        number,
        string[],
        string,
        string | string[],
      ];
      iconName: string;
    };
    const [width, height, ligatures, _unicode, svgPathData] = icon;

    // handle strings and array differently from each other
    const body =
      typeof svgPathData === 'string'
        ? `<path fill="currentColor" d="${svgPathData}" />`
        : `<g fill="currentColor">${svgPathData.map(x => `<path d="${x}" />`).join('')}</g>`;

    iconSet.setIcon(name, {
      body,
      height,
      width,
    });

    for (const x of ligatures) {
      // ignore the aliases that are numbers.
      if (Number.isNaN(Number(x))) {
        iconSet.setAlias(x, name);
      }
    }
  }

  // generate the json
  const data = iconSet.export();
  const dataJson = JSON.stringify(data, null, 2);

  // set the path target for the json file
  const jsonTargetDir = join(collectionTargetDir, iconData.prefix);
  const fileName = join(jsonTargetDir, 'icons.json');

  // create the file
  mkdirSync(jsonTargetDir, {
    recursive: true,
  });
  writeFileSync(fileName, dataJson, {
    encoding: 'utf-8',
  });
}
*/
