<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Security\Authorization;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Implementation of Sulu specific security checks, includes a subject, the type of permission and the localization.
 */
class SecurityChecker extends AbstractSecurityChecker
{
    /**
     * @var TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var AuthorizationCheckerInterface
     */
    private $authorizationChecker;

    public function __construct(
        TokenStorageInterface $tokenStorage,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->tokenStorage = $tokenStorage;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function hasPermission($subject, $permission)
    {
        if (!$subject) {
            // if there is no subject the operation is allowed, since we have nothing to check against
            return true;
        }

        if (\is_string($subject)) {
            $subject = new SecurityCondition($subject);
        }

        $granted = $this->authorizationChecker->isGranted($permission, $subject);

        return $granted;
    }
}
