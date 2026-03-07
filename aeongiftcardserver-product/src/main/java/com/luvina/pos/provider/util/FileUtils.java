package com.luvina.pos.provider.util;

import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.function.Consumer;
import java.util.stream.Stream;

@Slf4j
public class FileUtils {

    private FileUtils() {
    }

    /**
     * Creates parent directories for the given file path if they don't exist.
     * Throws exception if creation fails.
     *
     * @param filePath Full path to the file
     * @throws IOException if parent directories cannot be created
     */
    public static void ensureParentDirectoriesExist(String filePath) throws IOException {
        File file = new File(filePath);
        File parentDir = file.getParentFile();

        if (parentDir == null) {
            return; // No parent directory (root or relative path)
        }

        if (parentDir.exists()) {
            if (!parentDir.isDirectory()) {
                throw new IOException("Parent path exists but is not a directory: " + parentDir.getAbsolutePath());
            }
            return; // Directory already exists
        }

        // Try to create directories
        boolean created = parentDir.mkdirs();
        if (!created) {
            throw new IOException("Failed to create parent directories: " + parentDir.getAbsolutePath());
        }

        log.info("Created parent directories: {}", parentDir.getAbsolutePath());
    }

    /**
     * Clears all files within a directory without deleting the directory itself.
     * * @param folderPath Path to the target directory
     */
    public static void clearFolderContent(String folderPath) {
        Path path = Paths.get(folderPath);

        if (!Files.exists(path)) {
            log.warn("Target path does not exist: {}", folderPath);
            return;
        }

        if (!Files.isDirectory(path)) {
            log.error("Provided path is not a directory: {}", folderPath);
            return;
        }

        // Use try-with-resources to ensure the Stream is closed
        try (Stream<Path> walk = Files.walk(path)) {
            walk.sorted(Comparator.reverseOrder()) // Reverse order to delete files/subfolders before parent folder
                    .filter(p -> !p.equals(path))      // Keep the root directory itself
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                            log.debug("Deleted: {}", p);
                        } catch (IOException e) {
                            log.error("Failed to delete: {} - Error: {}", p, e.getMessage());
                        }
                    });

            log.info("Successfully cleared content of folder: {}", folderPath);
        } catch (IOException e) {
            log.error("Critical error during folder cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Scans and processes all files in a directory, returning a list of processing results.
     *
     * @param folderPath    The path to the folder to scan
     * @param fileProcessor A lambda function to process each file (using Java's Function interface)
     */
    public static void processFilesInFolder(
            String folderPath,
            Consumer<File> fileProcessor) {

        File folder = new File(folderPath);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("Path invalid or does not exist: {}", folderPath);
            return;
        }

        File[] files = folder.listFiles();
        if (files == null || files.length == 0) {
            log.info("No files found in: {}", folderPath);
            return;
        }

        for (File file : files) {
            fileProcessor.accept(file);
        }
    }

    /**
     * Retrieves the parent folder of a given file or directory path.
     * * @param path The absolute or relative path
     * @return The parent folder path, or null if the path has no parent
     */
    public static String getParentDirectory(String path) {
        if (path == null || path.isEmpty()) {
            log.warn("Provided path is null or empty");
            return null;
        }

        File file = new File(path);
        String parent = file.getParent();

        if (parent != null) {
            log.debug("Parent directory for [{}] is [{}]", path, parent);
        } else {
            log.info("No parent directory found for path: {}", path);
        }

        return parent;
    }
}
