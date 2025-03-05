import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Enhanced block registration with comprehensive logging
try {
  // Log block registration attempt
  console.log('Attempting to register block:', metadata.name);

  // Verify critical dependencies before registration
  if (!Edit) {
    throw new Error('Edit component is missing');
  }

  if (!save) {
    throw new Error('Save component is missing');
  }

  // Extensive block registration with error handling
  const registeredBlock = registerBlockType(metadata.name, {
    edit: Edit,
    save,
    // Optional: Add extra metadata for debugging
    __experimentalBlockRegistration: {
      registrationTime: new Date().toISOString(),
      blockName: metadata.name,
      version: metadata.version
    }
  });

  // Log successful registration
  console.log('Block registered successfully:', {
    name: metadata.name,
    title: metadata.title,
    registeredBlock
  });
} catch (error) {
  // Comprehensive error logging
  console.error('Block Registration Error:', {
    blockName: metadata.name,
    errorMessage: error.message,
    errorStack: error.stack
  });

  // Optional: Trigger a more visible error notification
  if (window.console && console.warn) {
    console.warn(`
      ⚠️ Block Registration Failed: ${metadata.name}
      Please check your block configuration and dependencies.
    `);
  }
}