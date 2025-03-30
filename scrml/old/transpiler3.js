import { readFile, writeFile } from 'fs/promises';
import { parse } from 'node-html-parser';

async function processHtmlFile(inputFilePath, outputFilePath) {
    try {
        // Read the HTML file
        const htmlContent = await readFile(inputFilePath, 'utf-8');

        // Parse the HTML content
        const root = parse(htmlContent);

        // Extract the CSS (assuming it's within the <head> tag)
        const head = root.querySelector('head');
        const cssContent = head.querySelector('style')?.textContent || '';

        // Extract the JavaScript (assuming it's within the <body> tag)
        const body = root.querySelector('body');
        const jsContent = body.querySelector('script')?.textContent || '';

        // Create new <style> and <script> tags
        const styleTag = `<style>${cssContent}</style>`;
        const scriptTag = `<script>${jsContent}</script>`;

        // Remove the old CSS and JavaScript from the HTML
        head.querySelector('style')?.remove();
        body.querySelector('script')?.remove();

        // Insert the new <style> and <script> tags
        head.insertAdjacentHTML('beforeend', styleTag);
        body.insertAdjacentHTML('beforeend', scriptTag);

        // Get the updated HTML content
        const updatedHtmlContent = root.toString();

        // Write the updated HTML content to the output file
        await writeFile(outputFilePath, updatedHtmlContent, 'utf-8');

        console.log('HTML file processed successfully!');
    } catch (error) {
        console.error('Error processing HTML file:', error);
    }
}

// Usage
const inputFilePath = 'examp.html';
const outputFilePath = 'output2.html';
processHtmlFile(inputFilePath, outputFilePath);