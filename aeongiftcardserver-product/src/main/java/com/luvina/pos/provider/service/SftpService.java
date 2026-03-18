package com.luvina.pos.provider.service;

import com.jcraft.jsch.*;
import com.luvina.pos.provider.exception.FtpConnectionException;
import com.luvina.pos.provider.exception.FtpSendFileException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class SftpService {

    @Value("${sftp.gift.host}")
    private String host;

    @Value("${sftp.gift.port}")
    private int port;

    @Value("${sftp.gift.username}")
    private String username;

    @Value("${sftp.gift.private-key-path}")
    private String privateKeyPath;

    @Value("${sftp.gift.remote-path}")
    private String remotePath;

    private static final String SEPARATOR_CHAR = "/";

    public void upload(String fileName, File file) throws FtpSendFileException, FtpConnectionException, IOException {

        try (InputStream inputStream = new FileInputStream(file)) {
            upload(fileName, inputStream);
        }
    }

    public void upload(String fileName, InputStream file) throws FtpConnectionException, FtpSendFileException, IOException {
        Session session = null;
        ChannelSftp sftpChannel = null;
        String tempFileName = "dummy_" + fileName;

        try {
            session = connectToServer();
            sftpChannel = openSftpChannel(session);
            createRemoteDirectory(sftpChannel, remotePath);
            changeToRemoteDirectory(sftpChannel);
            uploadFile(sftpChannel, tempFileName, file);
            sftpChannel.rename(tempFileName, fileName);
        } catch (FtpConnectionException | FtpSendFileException e) {
            log.error(e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new FtpConnectionException(e.getMessage());
        } finally {
            if (file != null) {
                file.close();
            }
            disconnectSafely(sftpChannel, session);
        }
    }

    private Session connectToServer() throws FtpConnectionException {
        try {
            Session session = getSession();

            if (!session.isConnected()) {
                log.error("SFTP server refused connection (host:{}, port:{})", host, port);
                throw new FtpConnectionException("SFTP server refused connection (host:" + host + ", port:" + port + ")");
            }

            log.info("Connected to SFTP server (host:{}, port:{})", host, port);
            return session;

        } catch (JSchException | IOException e) {
            log.error("SFTP connection failed (host:{}, port:{})", host, port);
            throw new FtpConnectionException("SFTP connection failed: " + e.getMessage());
        }
    }

    private Session getSession() throws JSchException, IOException {
        JSch jSch = new JSch();

        jSch.addIdentity(privateKeyPath);

        Session session = jSch.getSession(username, host, port);

        Map<String, String> config = new HashMap<>();
        config.put("StrictHostKeyChecking", "no");
        config.put("UserKnownHostsFile", "/dev/null");
        session.setConfig(new Hashtable<>(config));

        session.connect();
        return session;
    }

    private ChannelSftp openSftpChannel(Session session) throws FtpConnectionException {
        try {
            Channel channel = session.openChannel("sftp");
            channel.connect();
            log.info("SFTP channel opened successfully (user:{})", username);
            return (ChannelSftp) channel;
        } catch (JSchException e) {
            log.error("Failed to open SFTP channel (user:{})", username);
            throw new FtpConnectionException("Failed to open SFTP channel: " + e.getMessage());
        }
    }

    private void changeToRemoteDirectory(ChannelSftp sftpChannel) throws FtpSendFileException {
        try {
            sftpChannel.cd(remotePath);
        } catch (SftpException e) {
            log.error("Failed to change to remote directory: {}", remotePath);
            throw new FtpSendFileException("Failed to change to remote directory: " + remotePath);
        }
    }

    private void uploadFile(ChannelSftp sftpChannel, String fileName, InputStream file) throws FtpSendFileException {
        try {
            sftpChannel.put(file, fileName);
            log.info("File uploaded successfully: {}", fileName);
        } catch (SftpException e) {
            log.error("Failed to upload file: {}", fileName);
            throw new FtpSendFileException("Failed to upload file: " + fileName + ". Error: " + e.getMessage());
        }
    }

    private void disconnectSafely(ChannelSftp sftpChannel, Session session) {
        try {
            if (sftpChannel != null && sftpChannel.isConnected()) {
                sftpChannel.exit();
                sftpChannel.disconnect();
            }
        } catch (Exception e) {
            log.error("Error closing SFTP channel: {}", e.getMessage());
        }

        try {
            if (session != null && session.isConnected()) {
                session.disconnect();
            }
        } catch (Exception e) {
            log.error("Error disconnecting SFTP session: {}", e.getMessage());
        }
    }

    private void createRemoteDirectory(ChannelSftp sftpChannel, String remotePath) throws FtpConnectionException {
        String[] pathParts = remotePath.split(SEPARATOR_CHAR);
        StringBuilder currentPath = new StringBuilder();

        for (String part : pathParts) {
            if (part.isEmpty()) {
                continue;
            }
            currentPath.append(SEPARATOR_CHAR).append(part);
            try {
                sftpChannel.stat(currentPath.toString());
            } catch (SftpException e) {
                try {
                    sftpChannel.mkdir(currentPath.toString());
                    log.info("Created remote directory: {}", currentPath);
                } catch (SftpException mkdirEx) {
                    log.error("Could not create directory: {}", currentPath);
                    throw new FtpConnectionException("Could not create directory: " + currentPath + ". Error: " + mkdirEx.getMessage());
                }
            }
        }
    }
}
